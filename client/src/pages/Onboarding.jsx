import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import Spinner from '../components/Spinner.jsx';

const STEPS = [
  { icon: '\uD83D\uDCCE', title: 'Share the file', desc: 'Drop in a design, PDF, or image. Your client opens it right in the browser \u2014 no account, no download.' },
  { icon: '\uD83D\uDCCD', title: 'Collect feedback in place', desc: 'Clients click anywhere on the file to drop a comment pin. Feedback is pinned to the exact spot.' },
  { icon: '\u2705', title: 'Get a clear approval', desc: 'One click marks a version approved, with a timestamp and the approver\u2019s name.' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', client_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Give your project a name.'); return; }
    setError(''); setLoading(true);
    try {
      const project = await api.post('/projects', { name: form.name.trim(), client_name: form.client_name.trim() || null });
      navigate(`/project/${project.id}`);
    } catch (err) { setError(err.message || 'Failed to create project.'); setLoading(false); }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--mist)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <div style={{ width:'100%', maxWidth:'600px' }}>
        {step === 0 && (
          <>
            <div style={{ marginBottom:'2.5rem' }}>
              <p style={{ fontSize:'.8125rem', fontWeight:600, letterSpacing:'.07em', textTransform:'uppercase', color:'var(--teal)', marginBottom:'.75rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--amber)', display:'inline-block' }}></span>Welcome to Loop
              </p>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:600, lineHeight:1.15, letterSpacing:'-.02em', marginBottom:'1rem', maxWidth:'22ch' }}>Client feedback, finally out of your inbox.</h1>
              <p style={{ fontSize:'1.0625rem', color:'var(--text-muted)', maxWidth:'50ch', lineHeight:1.65 }}>
                <strong style={{ color:'var(--ink)' }}>The problem:</strong> Client feedback is scattered across email, WhatsApp, and Slack.
              </p>
              <p style={{ fontSize:'1.0625rem', color:'var(--text-muted)', maxWidth:'50ch', lineHeight:1.65, marginTop:'.75rem' }}>
                <strong style={{ color:'var(--ink)' }}>The fix:</strong> Loop pins every comment to the exact spot on the file and turns "looks good" into a real, timestamped approval.
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'2.5rem' }}>
              {STEPS.map((s, i) => (
                <div key={i} className="card" style={{ display:'flex', gap:'1rem', alignItems:'flex-start', padding:'1.25rem 1.5rem' }}>
                  <span style={{ fontSize:'1.5rem', flexShrink:0 }}>{s.icon}</span>
                  <div>
                    <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', fontWeight:600, marginBottom:'.25rem' }}>{s.title}</h3>
                    <p style={{ fontSize:'.9rem', color:'var(--text-muted)', lineHeight:1.6 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ fontSize:'1rem', padding:'.875rem 2rem' }} onClick={() => setStep(1)}>
              Create my first project &rarr;
            </button>
          </>
        )}

        {step === 1 && (
          <div className="card" style={{ padding:'2rem' }}>
            <button onClick={() => setStep(0)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'.875rem', marginBottom:'1.5rem' }}>&larr; Back</button>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', fontWeight:600, marginBottom:'.375rem' }}>Name your first project</h2>
            <p style={{ color:'var(--text-muted)', fontSize:'.9375rem', marginBottom:'1.75rem' }}>You can always change this later.</p>
            {error && <div style={{ background:'#fdf0ef', border:'1px solid #f5c0bb', borderRadius:6, padding:'.75rem 1rem', marginBottom:'1.25rem', fontSize:'.875rem', color:'#c0392b' }}>{error}</div>}
            <form onSubmit={handleCreate}>
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="pn">Project name *</label>
                  <input id="pn" type="text" required className="form-input" placeholder="Brand Identity v3" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cn">Client name (optional)</label>
                  <input id="cn" type="text" className="form-input" placeholder="Sarah M." value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop:'.5rem' }}>
                  {loading ? <><Spinner size={16} color="#fff" /> Creating...</> : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
