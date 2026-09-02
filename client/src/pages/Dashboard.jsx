import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Spinner from '../components/Spinner.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../App.jsx';

function NewProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', client_name: '', deadline: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required.'); return; }
    setError(''); setLoading(true);
    try {
      const project = await api.post('/projects', { name: form.name.trim(), client_name: form.client_name || null, deadline: form.deadline || null });
      onCreated(project);
    } catch (err) {
      setError(err.body?.upgrade ? err.message + ' Visit Pricing to upgrade.' : err.message || 'Failed.');
      setLoading(false);
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(34,40,42,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500, padding:'1rem' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card" style={{ width:'100%', maxWidth:'480px', padding:'2rem' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:600, marginBottom:'1.5rem' }}>New project</h2>
        {error && <div style={{ background:'#fdf0ef', border:'1px solid #f5c0bb', borderRadius:6, padding:'.75rem 1rem', marginBottom:'1rem', fontSize:'.875rem', color:'#c0392b' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div className="form-group"><label className="form-label">Project name *</label><input type="text" required className="form-input" placeholder="Brand Identity v3" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Client name</label><input type="text" className="form-input" placeholder="Sarah M." value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Review deadline</label><input type="date" className="form-input" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} /></div>
            <div style={{ display:'flex', gap:'.75rem', marginTop:'.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex:1 }} disabled={loading}>{loading ? 'Creating\u2026' : 'Create project'}</button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { profile } = useAuth();
  const upgraded = params.get('upgrade') === 'success';

  useEffect(() => { api.get('/projects').then(setProjects).catch(() => {}).finally(() => setLoading(false)); }, []);

  const statusOrder = { ready: 0, waiting: 1, approved: 2 };
  const sorted = [...projects].sort((a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3));

  return (
    <Layout>
      <div className="container" style={{ paddingBlock: 'clamp(2rem,5vw,3.5rem)' }}>
        {upgraded && (
          <div style={{ background:'#ecf7f0', border:'1px solid #a8d9b5', borderRadius:8, padding:'1rem 1.25rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'.75rem' }}>
            <span style={{ fontSize:'1.25rem' }}>{'\uD83C\uDF89'}</span>
            <span style={{ fontSize:'.9375rem', color:'#1a6632', fontWeight:500 }}>Plan upgraded! You now have access to all {profile?.plan} features.</span>
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem', gap:'1rem', flexWrap:'wrap' }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:600, letterSpacing:'-.02em' }}>Your Inbox</h1>
            <p style={{ color:'var(--text-muted)', marginTop:'.25rem', fontSize:'.9375rem' }}>All your active client reviews in one place.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New project</button>
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}><Spinner size={32} /></div>
        ) : sorted.length === 0 ? (
          <div style={{ padding:'4rem 0', maxWidth:'540px' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:600, marginBottom:'.75rem' }}>No projects yet</h2>
            <p style={{ color:'var(--text-muted)', fontSize:'1rem', lineHeight:1.65, marginBottom:'1rem' }}>
              <strong style={{ color:'var(--ink)' }}>Why Loop?</strong> Freelancers lose paid hours every week to feedback archaeology. Loop removes that entirely.
            </p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create your first project</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', background:'var(--white)', border:'var(--sage-line)', borderRadius:10, overflow:'hidden' }}>
            {sorted.map((p, i) => (
              <Link key={p.id} to={`/project/${p.id}`}
                style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'.375rem .75rem', padding:'1rem 1.25rem', borderBottom: i < sorted.length - 1 ? 'var(--sage-line)' : 'none', textDecoration:'none', color:'inherit', transition:'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background='#fafaf8'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <span style={{ fontWeight:600, fontSize:'.9375rem' }}>{p.name}</span>
                <StatusBadge status={p.status} />
                <span style={{ fontSize:'.8125rem', color:'var(--text-muted)', gridColumn:1 }}>
                  {p.client_name && `${p.client_name} \u00B7 `}{p.files?.length || 0} file{p.files?.length !== 1 ? 's' : ''}
                </span>
                {p.deadline && <span style={{ fontSize:'.75rem', color:'var(--text-subtle)', gridColumn:1 }}>Due: {new Date(p.deadline).toLocaleDateString('en-US', { month:'short', day:'numeric' })}</span>}
              </Link>
            ))}
          </div>
        )}
      </div>
      {showModal && <NewProjectModal onClose={() => setShowModal(false)} onCreated={p => { setShowModal(false); navigate(`/project/${p.id}`); }} />}
    </Layout>
  );
}
