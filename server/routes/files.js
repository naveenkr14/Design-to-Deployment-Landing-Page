import { Router } from 'express';
import { requireAuth } from '../lib/authMiddleware.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import multer from 'multer';
import { randomUUID } from 'node:crypto';

export const filesRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(file.mimetype));
  },
});

// Upload through the authenticated server so Storage permissions are handled
// by the server-only client after project ownership has been verified.
filesRouter.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  let storagePath;
  try {
    const { project_id } = req.body;
    if (!project_id || !req.file) {
      return res.status(400).json({ error: 'project_id and file are required' });
    }

    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects').select('id').eq('id', project_id).eq('owner_id', req.user.id).maybeSingle();
    if (projectError) throw projectError;
    if (!project) return res.status(403).json({ error: 'Forbidden' });

    const extension = req.file.originalname.includes('.')
      ? req.file.originalname.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '')
      : 'bin';
    storagePath = `${project_id}/${randomUUID()}.${extension || 'bin'}`;
    const { error: storageError } = await supabaseAdmin.storage.from('files').upload(
      storagePath,
      req.file.buffer,
      { contentType: req.file.mimetype, upsert: false },
    );
    if (storageError) throw storageError;

    const { data: { publicUrl } } = supabaseAdmin.storage.from('files').getPublicUrl(storagePath);
    const { data, error } = await supabaseAdmin
      .from('files')
      .insert({ project_id, file_url: publicUrl, file_name: req.file.originalname })
      .select()
      .single();
    if (error) {
      await supabaseAdmin.storage.from('files').remove([storagePath]);
      throw error;
    }
    res.status(201).json(data);
  } catch (err) { next(err); }
});

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
