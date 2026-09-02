import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../lib/auth.js';
import SocialAuth from '../components/SocialAuth.jsx';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RULES = [
  { label: '8 or more characters', test: password => password.length >= 8 },
  { label: 'One uppercase letter', test: password => /[A-Z]/.test(password) },
  { label: 'One lowercase letter', test: password => /[a-z]/.test(password) },
  { label: 'One number', test: password => /\d/.test(password) },
  { label: 'One special character', test: password => /[^A-Za-z0-9]/.test(password) },
];

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const navigate = useNavigate();

  const passwordChecks = PASSWORD_RULES.map(rule => rule.test(form.password));
  const passwordScore = passwordChecks.filter(Boolean).length;
  const passwordStrong = passwordScore === PASSWORD_RULES.length;
  const emailValid = EMAIL_PATTERN.test(form.email.trim());

  function getPasswordStatus() {
    if (!form.password) return { label: 'Add a strong password', tone: 'caution' };
    if (passwordStrong) return { label: 'Strong password', tone: 'strong' };
    if (passwordScore >= 3) return { label: 'Almost there', tone: 'weak' };
    return { label: 'Password needs more strength', tone: 'weak' };
  }

  const passwordStatus = getPasswordStatus();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const email = form.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      setEmailTouched(true);
      setError('Enter a valid email like alex@studio.com. Remove quotes or spaces around the address.');
      return;
    }
    if (!passwordStrong) { setError('Choose a stronger password using the checklist below.'); return; }
    setLoading(true);
    try {
      const data = await signUp({ ...form, email, name: form.name.trim() });
      // If Supabase returned a session, email confirmation is disabled — go straight in
      if (data.session) {
        navigate('/onboarding');
      } else {
        // Email confirmation is enabled — show a "check your email" message
        setEmailSent(true);
      }
    }
    catch (err) {
      const message = /email.*invalid|invalid.*email/i.test(err.message || '')
        ? 'That email was rejected. Use a valid address such as alex@studio.com and check for spaces or quotes.'
        : (err.message || 'Signup failed.');
      setError(message);
    }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'var(--mist)' }}>
      <div style={{ width:'100%', maxWidth:'440px' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'.5rem', marginBottom:'2rem', width:'fit-content' }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="13" stroke="#1F6F63" strokeWidth="2.5"/><circle cx="16" cy="16" r="6" fill="#1F6F63" opacity="0.18"/><circle cx="23" cy="9" r="3.5" fill="#E8A33D"/></svg>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'1.2rem' }}>Loop</span>
        </Link>

        {emailSent ? (
          <div className="card" style={{ padding:'2rem', textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>📬</div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:600, marginBottom:'.5rem' }}>Check your email</h1>
            <p style={{ color:'var(--text-muted)', fontSize:'.9375rem', lineHeight:1.65, marginBottom:'1.5rem' }}>
              We sent a confirmation link to <strong style={{ color:'var(--ink)' }}>{form.email}</strong>. Click the link to activate your account.
            </p>
            <p style={{ fontSize:'.8125rem', color:'var(--text-subtle)', lineHeight:1.5 }}>
              Didn't get it? Check your spam folder, or <button onClick={() => setEmailSent(false)} style={{ color:'var(--teal)', fontWeight:600, background:'none', border:'none', cursor:'pointer', textDecoration:'underline', font:'inherit' }}>try again</button>.
            </p>
            <div style={{ marginTop:'1.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Go to login</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="card" style={{ padding:'2rem' }}>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:600, marginBottom:'.375rem' }}>Start your free trial</h1>
          <p style={{ color:'var(--text-muted)', marginBottom:'1.75rem', fontSize:'.9375rem' }}>14 days free. No credit card required.</p>
          {error && <div role="alert" style={{ background:'#fdf0ef', border:'1px solid #f5c0bb', borderRadius:6, padding:'.75rem 1rem', marginBottom:'1.25rem', fontSize:'.875rem', color:'#c0392b' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Your name</label>
                <input id="name" type="text" className="form-input" placeholder="Alex Chen" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email address</label>
                <input id="email" type="email" required autoComplete="email" spellCheck="false" className="form-input" placeholder="alex@studio.com" value={form.email} onBlur={() => setEmailTouched(true)} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} aria-invalid={emailTouched && form.email.length > 0 && !emailValid} style={{ borderColor: emailTouched && form.email.length > 0 ? (emailValid ? '#2e8b4f' : '#c0392b') : undefined }} />
                {emailTouched && form.email.length > 0 && !emailValid && <span className="form-error">Use a valid address, for example alex@studio.com.</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div style={{ position:'relative' }}>
                  <input id="password" type={showPassword ? 'text' : 'password'} required autoComplete="new-password" className="form-input" placeholder="Create a strong password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ paddingRight:'3.25rem', borderColor: form.password ? (passwordStrong ? '#2e8b4f' : '#c0392b') : undefined }} />
                  <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} style={{ position:'absolute', top:'50%', right:'.5rem', transform:'translateY(-50%)', display:'inline-flex', alignItems:'center', justifyContent:'center', width:'2.25rem', height:'2.25rem', border:0, borderRadius:5, background:'transparent', color:'var(--text-muted)' }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      {showPassword ? <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></> : <><path d="M3 3l18 18" /><path d="M10.6 6.2A9.4 9.4 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3 3.7M6.2 6.7C3.8 8.2 2.5 12 2.5 12s3.5 6 9.5 6c1 0 1.9-.2 2.7-.5" /></>}
                    </svg>
                  </button>
                </div>
                <div aria-live="polite" className={passwordStatus.tone === 'caution' ? 'password-caution' : passwordStatus.tone === 'strong' ? 'password-strong' : ''} style={{ display:'flex', alignItems:'center', gap:'.45rem', color: passwordStatus.tone === 'strong' ? '#2e8b4f' : passwordStatus.tone === 'caution' ? '#9a6200' : '#c0392b', fontSize:'.8125rem', fontWeight:600 }}>
                  <span aria-hidden="true">{passwordStatus.tone === 'strong' ? '✓' : '!'}</span>{passwordStatus.label}
                </div>
                {!form.password && <span className="form-hint">Tip: use 3 unrelated words, a number, and a symbol.</span>}
                <ul aria-label="Password requirements" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.4rem .75rem', marginTop:'.25rem' }}>
                  {PASSWORD_RULES.map((rule, index) => (
                    <li key={rule.label} className={`password-rule ${passwordChecks[index] ? 'password-rule--valid' : ''}`}>
                      <span className="password-rule__icon" aria-hidden="true">{passwordChecks[index] ? '✓' : '×'}</span>{rule.label}
                    </li>
                  ))}
                </ul>
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop:'.5rem' }}>
                {loading ? 'Creating account\u2026' : 'Create free account'}
              </button>
            </div>
          </form>
          <p style={{ marginTop:'1rem', fontSize:'.8125rem', color:'var(--text-subtle)', lineHeight:1.5 }}>By signing up you agree to Loop's Terms of Service and Privacy Policy.</p>
          <SocialAuth redirectTo="/onboarding" onError={setError} />
        </div>
        <p style={{ marginTop:'1.25rem', fontSize:'.875rem', color:'var(--text-muted)', textAlign:'center' }}>
          Already have an account? <Link to="/login" style={{ color:'var(--teal)', fontWeight:600 }}>Sign in</Link>
        </p>
          </>
        )}
      </div>
    </div>
  );
}
