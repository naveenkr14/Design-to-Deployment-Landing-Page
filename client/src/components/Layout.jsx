import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App.jsx';
import { signOut } from '../lib/auth.js';
import StatusBadge from './StatusBadge.jsx';

function LoopMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="13" stroke="#1F6F63" strokeWidth="2.5"/>
      <circle cx="16" cy="16" r="6" fill="#1F6F63" opacity="0.18"/>
      <circle cx="23" cy="9" r="3.5" fill="#E8A33D"/>
    </svg>
  );
}

export default function Layout({ children }) {
  const { session, profile } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    try { await signOut(); navigate('/'); } catch {}
  }

  return (
    <>
      <header style={{
        position:'sticky', top:0, zIndex:100, background:'var(--mist)',
        borderBottom:'var(--sage-line)', paddingBlock:'.875rem',
      }}>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1.5rem' }}>
          <Link to={session ? '/dashboard' : '/'} style={{ display:'flex', alignItems:'center', gap:'.5rem', textDecoration:'none' }}>
            <LoopMark />
            <span style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'1.25rem', color:'var(--ink)' }}>Loop</span>
          </Link>

          {session ? (
            <nav style={{ display:'flex', alignItems:'center', gap:'1.25rem' }}>
              <NavLink to="/dashboard" style={({ isActive }) => ({ opacity: isActive ? 1 : 0.65, fontSize:'.9rem', fontWeight:500, color:'var(--ink)' })}>Dashboard</NavLink>
              <NavLink to="/settings"  style={({ isActive }) => ({ opacity: isActive ? 1 : 0.65, fontSize:'.9rem', fontWeight:500, color:'var(--ink)' })}>Settings</NavLink>
              {profile && <StatusBadge status={profile.plan} />}
              <button className="btn btn-sm btn-secondary" onClick={handleSignOut}>Sign out</button>
            </nav>
          ) : (
            <nav style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <Link to="/login" style={{ fontSize:'.9375rem', fontWeight:500, opacity:.75, color:'var(--ink)' }}>Log in</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Start free trial</Link>
            </nav>
          )}
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
