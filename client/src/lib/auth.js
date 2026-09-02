import { supabase } from './supabase.js';
import { api } from './api.js';
export async function signUp({ email, password, name }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { name: name?.trim() || null } },
  });
  if (error) throw error;
  if (data.session) { try { await api.post('/auth/sync-user', { name }); } catch {} }
  return data;
}
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;

  // Do not navigate until Supabase has a usable persisted session. This also
  // handles projects configured to require email confirmation, where a sign-in
  // response may not include an access token.
  if (!data?.session?.access_token) {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData?.session?.access_token) {
      throw new Error('Sign-in did not create an active session. Please verify your email and try again.');
    }
    return { ...data, session: sessionData.session };
  }

  return data;
}
export async function signInWithProvider(provider, redirectTo) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
  if (error) throw error;
  return data;
}
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
