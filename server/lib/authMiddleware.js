import { createClient } from '@supabase/supabase-js';

function isAuthTransportError(error) {
  return error?.name === 'AuthRetryableFetchError'
    || error?.status === 0
    || error?.code === 'EACCES'
    || error?.message === 'fetch failed';
}

// Verifies the Supabase JWT from Authorization: Bearer <token>
export async function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return res.status(401).json({ error: 'Missing auth token' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  let result;
  try {
    result = await supabase.auth.getUser(token);
  } catch (error) {
    if (isAuthTransportError(error)) {
      return res.status(503).json({ error: 'Authentication service temporarily unavailable' });
    }
    return next(error);
  }

  const { data: { user } = {}, error } = result;
  if (isAuthTransportError(error)) {
    return res.status(503).json({ error: 'Authentication service temporarily unavailable' });
  }
  if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  req.user = user;
  req.supabase = supabase;
  next();
}
