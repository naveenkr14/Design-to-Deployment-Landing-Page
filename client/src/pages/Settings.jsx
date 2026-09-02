import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Spinner from '../components/Spinner.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../App.jsx';
import { signOut } from '../lib/auth.js';

export default function Settings() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function handleSaveName(e) {
    e.preventDefault();
    setSaving(true); setMsg(''); setErr('');
    try { await api.patch('/auth/me', { name }); await refreshProfile(); setMsg('Name updated.'); }
    catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  async function handleBillingPortal() {
    setPortalLoading(true); setErr('');
    try { const { url } = await api.post('/stripe/portal', {}); window.location.href = url; }
    catch (e) { setErr(e.message || 'No billing account.'); setPortalLoading(false); }
  }

  return (
    <Layout>
      <div className="container" style={{ paddingBlock:'clamp(2rem,5vw,3.5rem)', maxWidth:620 }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,3vw,2rem)', fontWeight:600, letterSpacing:'-.02em', marginBottom:'2rem' }}>Settings</h1>

        {err && <div style={{ background:'#fdf0ef', border:'1px solid #f5c0bb', borderRadius:6, padding:'.75rem 1rem', marginBottom:'1.25rem', fontSize:'.875rem', color:'#c0392b' }}>{err}</div>}
        {msg && <div style={{ background:'#ecf7f0', border:'1px solid #a8d9b5', borderRadius:6, padding:'.75rem 1rem', marginBottom:'1.25rem', fontSize:'.875rem', color:'#1a6632' }}>{msg}</div>}

        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.15rem', fontWeight:600, marginBottom:'1.25rem' }}>Profile</h2>
          <form onSubmit={handleSaveName}>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="form-group"><label className="form-label">Display name</label><input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></div>
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={profile?.email || ''} disabled style={{ opacity:.65, cursor:'not-allowed' }} /><span className="form-hint">Email cannot be changed here.</span></div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ width:'fit-content' }} disabled={saving}>{saving ? 'Saving\u2026' : 'Save changes'}</button>
            </div>
          </form>
        </div>

        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:'.75rem' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.15rem', fontWeight:600 }}>Billing</h2>
            {profile && <StatusBadge status={profile.plan} />}
          </div>
          <p style={{ fontSize:'.9375rem', color:'var(--text-muted)', marginBottom:'1.25rem', lineHeight:1.6 }}>
            {profile?.plan === 'free' ? 'You are on the Free plan. Upgrade for more projects.' : `You are on the ${profile?.plan === 'solo' ? 'Solo ($9/mo)' : 'Studio ($29/mo)'} plan.`}
          </p>
          <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap' }}>
            {profile?.plan === 'free' && <a href="/pricing" className="btn btn-primary btn-sm">Upgrade plan</a>}
            <button className="btn btn-secondary btn-sm" onClick={handleBillingPortal} disabled={portalLoading}>
              {portalLoading ? <Spinner size={14} /> : 'Manage billing'}
            </button>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.15rem', fontWeight:600, marginBottom:'1rem' }}>Account</h2>
          <button className="btn btn-danger btn-sm" onClick={async () => { await signOut(); navigate('/'); }}>Sign out</button>
        </div>
      </div>
    </Layout>
  );
}
