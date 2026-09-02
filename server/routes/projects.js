import { Router } from 'express';
import { requireAuth } from '../lib/authMiddleware.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export const projectsRouter = Router();

const PLAN_LIMITS = { free: 1, solo: 5, studio: Infinity };

// GET /api/projects
projectsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*, files(id, file_url, file_name, uploaded_at), approvals(approved_by_name, approved_at)')
      .eq('owner_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// GET /api/projects/:id
projectsRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*, files(*, comments(*)), approvals(*)')
      .eq('id', req.params.id)
      .eq('owner_id', req.user.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Project not found' });
    res.json(data);
  } catch (err) { next(err); }
});

// POST /api/projects
projectsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    // Check plan limits
    const { data: profile } = await supabaseAdmin
      .from('users').select('plan').eq('id', req.user.id).single();
    const plan = profile?.plan || 'free';
    const limit = PLAN_LIMITS[plan];

    if (limit !== Infinity) {
      const { count } = await supabaseAdmin
        .from('projects').select('id', { count: 'exact', head: true })
        .eq('owner_id', req.user.id);
      if (count >= limit) {
        return res.status(403).json({
          error: `Your ${plan} plan allows ${limit} project${limit === 1 ? '' : 's'}. Upgrade to create more.`,
          upgrade: true,
        });
      }
    }

    const { name, client_name, deadline } = req.body;
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({ owner_id: req.user.id, name, client_name, deadline, status: 'waiting' })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
});

// PATCH /api/projects/:id
projectsRouter.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const allowed = ['name', 'client_name', 'status', 'deadline'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updates)
      .eq('id', req.params.id)
      .eq('owner_id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// DELETE /api/projects/:id
projectsRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', req.params.id)
      .eq('owner_id', req.user.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) { next(err); }
});
