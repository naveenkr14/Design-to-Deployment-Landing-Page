import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signIn } from '../lib/auth.js';
import SocialAuth from '../components/SocialAuth.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/dashboard';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await signIn(form); navigate(next); }
    catch (err) { setError(err.message || 'Login failed.'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'var(--mist)' }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'2rem', width:'fit-content' }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="#1F6F63" strokeWidth="2.5"/><circle cx="16" cy="16" r="6" fill="#1F6F63" opacity="0.18"/><circle cx="23" cy="9" r="3.5" fill="#E8A33D"/></svg>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'1.2rem' }}>Loop</span>
        </Link>
        <div className="card" style={{ padding:'2rem' }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:600, marginBottom:'.375rem' }}>Welcome back</h1>
          <p style={{ color:'var(--text-muted)', marginBottom:'1.75rem', fontSize:'.9375rem' }}>Sign in to your Loop account.</p>
          {error && <div role="alert" style={{ background:'#fdf0ef', border:'1px solid #f5c0bb', borderRadius:6, padding:'.75rem 1rem', marginBottom:'1.25rem', fontSize:'.875rem', color:'#c0392b' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email address</label>
                <input id="email" type="email" required autoComplete="email" spellCheck="false" className="form-input" placeholder="alex@studio.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div style={{ position:'relative' }}>
                  <input id="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" className="form-input" placeholder="Your password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ paddingRight:'3.25rem' }} />
                  <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} style={{ position:'absolute', top:'50%', right:'.5rem', transform:'translateY(-50%)', display:'inline-flex', alignItems:'center', justifyContent:'center', width:'2.25rem', height:'2.25rem', border:0, borderRadius:5, background:'transparent', color:'var(--text-muted)' }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 3l18 18" /><path d="M10.6 6.2A9.4 9.4 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3 3.7M6.2 6.7C3.8 8.2 2.5 12 2.5 12s3.5 6 9.5 6c1 0 1.9-.2 2.7-.5" /></svg>
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop:'.5rem' }}>
                {loading ? 'Signing in\u2026' : 'Sign in'}
              </button>
            </div>
          </form>
          <SocialAuth redirectTo={next} onError={setError} />
        </div>
        <p style={{ marginTop:'1.25rem', fontSize:'.875rem', color:'var(--text-muted)', textAlign:'center' }}>
          No account? <Link to="/signup" style={{ color:'var(--teal)', fontWeight:600 }}>Start your free trial</Link>
        </p>
      </div>
    </div>
  );
}
