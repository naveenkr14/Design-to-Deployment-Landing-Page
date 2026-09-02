import { Router } from 'express';
import { requireAuth } from '../lib/authMiddleware.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export const approvalsRouter = Router();

// POST /api/approvals
approvalsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const { project_id, approved_by_name } = req.body;

    // Verify project ownership
    const { data: project } = await supabaseAdmin
      .from('projects').select('id, owner_id').eq('id', project_id).single();
    if (!project || project.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Insert approval
    const { data: approval, error: aErr } = await supabaseAdmin
      .from('approvals')
      .insert({ project_id, approved_by_name: approved_by_name || 'Client' })
      .select().single();
    if (aErr) throw aErr;

    // Update project status
    await supabaseAdmin.from('projects').update({ status: 'approved' }).eq('id', project_id);

    res.status(201).json(approval);
  } catch (err) { next(err); }
});
