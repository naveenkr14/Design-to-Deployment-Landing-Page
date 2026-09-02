import { Router } from 'express';
import { requireAuth } from '../lib/authMiddleware.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export const filesRouter = Router();

// Record a file after frontend uploads to Supabase Storage
filesRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const { project_id, file_url, file_name } = req.body;
    if (!project_id || !file_url) {
      return res.status(400).json({ error: 'project_id and file_url are required' });
    }
    // Verify ownership
    const { data: project } = await supabaseAdmin
      .from('projects').select('id').eq('id', project_id).eq('owner_id', req.user.id).single();
    if (!project) return res.status(403).json({ error: 'Forbidden' });

    const { data, error } = await supabaseAdmin
      .from('files')
      .insert({ project_id, file_url, file_name })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
});

// GET /api/files?project_id=
filesRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const { project_id } = req.query;
    const { data, error } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('project_id', project_id)
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});
