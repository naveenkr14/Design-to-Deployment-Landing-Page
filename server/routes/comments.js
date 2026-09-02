import { Router } from 'express';
import { requireAuth } from '../lib/authMiddleware.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export const commentsRouter = Router();

// GET /api/comments?file_id=
commentsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const { file_id } = req.query;
    const { data, error } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('file_id', file_id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
});

// POST /api/comments
commentsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const { file_id, pin_x, pin_y, body, author_name } = req.body;
    if (!file_id || pin_x == null || pin_y == null || !body) {
      return res.status(400).json({ error: 'file_id, pin_x, pin_y, body are required' });
    }
    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        file_id,
        author_id: req.user.id,
        author_name: author_name || req.user.email,
        pin_x: parseFloat(pin_x),
        pin_y: parseFloat(pin_y),
        body,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
});

// DELETE /api/comments/:id
commentsRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', req.params.id)
      .eq('author_id', req.user.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) { next(err); }
});
