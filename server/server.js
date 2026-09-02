import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { stripeRouter, stripeWebhookRouter } from './routes/stripe.js';
import { authRouter } from './routes/auth.js';
import { projectsRouter } from './routes/projects.js';
import { filesRouter } from './routes/files.js';
import { commentsRouter } from './routes/comments.js';
import { approvalsRouter } from './routes/approvals.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Stripe webhook needs raw body — mount BEFORE express.json()
app.use('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhookRouter);

// Standard middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// Routes
app.use('/api/auth',      authRouter);
app.use('/api/projects',  projectsRouter);
app.use('/api/files',     filesRouter);
app.use('/api/comments',  commentsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/stripe',    stripeRouter);

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(`Loop server on http://localhost:${PORT}`));
