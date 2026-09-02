import { Router } from 'express';
import { requireAuth } from '../lib/authMiddleware.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export const authRouter = Router();

// Called after Supabase signup to create the public.users row
authRouter.post('/sync-user', requireAuth, async (req, res, next) => {
  try {
    const { name } = req.body;
    const { id, email } = req.user;
    const { data, error } = await supabaseAdmin
      .from('users')
      // Do not include plan here: upsert updates existing rows, and including
      // the default would downgrade subscribed users on every login.
      .upsert({ id, email, name: name || null }, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// Get current user profile
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// Update user profile
authRouter.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const { name } = req.body;
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ name })
      .eq('id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});
