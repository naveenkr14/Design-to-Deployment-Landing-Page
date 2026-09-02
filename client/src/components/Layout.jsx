import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App.jsx';
import { signOut } from '../lib/auth.js';
import Icon from './Icon.jsx';
import { LogoMark } from './UI.jsx';

const primaryNav = [
  { label: 'Overview', icon: 'grid', to: '/dashboard' },
  { label: 'Projects', icon: 'folder', to: '/projects' },
  { label: 'Deployments', icon: 'zap', disabled: true },
  { label: 'Logs', icon: 'code', disabled: true },
];
const workspaceNav = [
  { label: 'Analytics', icon: 'chart', disabled: true },
  { label: 'Domains', icon: 'link', disabled: true },
  { label: 'Environment variables', icon: 'lock', disabled: true },
  { label: 'Integrations', icon: 'layers', disabled: true },
  { label: 'Team', icon: 'users', disabled: true },
];
const accountNav = [
  { label: 'Activity', icon: 'activity', disabled: true },
  { label: 'Notifications', icon: 'bell', disabled: true },
  { label: 'Billing', icon: 'sparkle', to: '/pricing' },
  { label: 'Settings', icon: 'settings', to: '/settings' },
];

function NavigationItem({ item, onNavigate }) {
  if (item.disabled) return <span className="nav-item nav-item--disabled" title={`${item.label} is coming soon`}><Icon name={item.icon} size={16} /><span className="nav-label">{item.label}</span><span className="nav-item__badge">Soon</span></span>;
  return <NavLink to={item.to} end={item.label === 'Overview'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onNavigate}><Icon name={item.icon} size={16} /><span className="nav-label">{item.label}</span></NavLink>;
}

function PublicHeader() {
  return <header className="public-header"><Link to="/" className="public-header__brand"><LogoMark small />Loop</Link><nav className="public-nav"><Link to="/pricing">Pricing</Link><Link to="/login">Sign in</Link><Link to="/signup" className="btn btn-primary btn-sm">Start free trial</Link></nav></header>;
}

export default function Layout({ children }) {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  async function handleSignOut() { try { await signOut(); navigate('/'); } catch {} }
  if (!session) return <><PublicHeader /><main>{children}</main></>;

  const displayName = profile?.name || session.user?.user_metadata?.name || session.user?.email?.split('@')[0] || 'Workspace member';
  const initials = displayName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  const closeMobile = () => setMobileOpen(false);

  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <Link to="/dashboard" className="sidebar__brand" onClick={closeMobile}><LogoMark /><span className="sidebar__brand-copy"><span className="sidebar__brand-name">Loop</span><span className="sidebar__brand-sub">Feedback platform</span></span></Link>
      <button className="workspace-switcher" type="button" title="Current workspace"><span className="workspace-switcher__avatar">{initials}</span><span className="workspace-switcher__copy"><span className="workspace-switcher__name">{displayName}&apos;s workspace</span><span className="workspace-switcher__meta">Personal workspace</span></span><Icon name="arrowDown" size={14} /></button>
      <nav className="sidebar__nav"><div className="nav-section">Workspace</div>{primaryNav.map(item => <NavigationItem key={item.label} item={item} onNavigate={closeMobile} />)}<div className="nav-section">Manage</div>{workspaceNav.map(item => <NavigationItem key={item.label} item={item} onNavigate={closeMobile} />)}<div className="nav-section">Account</div>{accountNav.map(item => <NavigationItem key={item.label} item={item} onNavigate={closeMobile} />)}</nav>
      <div className="sidebar__footer"><Link to="/pricing" className="sidebar__upgrade" onClick={closeMobile}><Icon name="sparkle" size={17} /><span className="sidebar__upgrade-copy"><strong>Unlock more with Pro</strong><span>More active projects and powerful workflows.</span></span><Icon name="chevron" size={14} /></Link></div>
    </aside>
    {mobileOpen && <button type="button" className="sidebar__overlay" aria-label="Close navigation" onClick={closeMobile} />}
    <div className="app-main"><header className="topbar"><div className="topbar__left"><button className="mobile-menu" type="button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Icon name="menu" size={19} /></button><div className="search-box"><Icon name="search" size={15} /><input aria-label="Search" placeholder="Search projects..." /><span className="command-key">⌘ K</span></div></div><div className="topbar__actions"><button className="icon-button" type="button" title="Help"><Icon name="help" size={17} /></button><button className="icon-button" type="button" title="Notifications"><Icon name="bell" size={17} /></button><span className="topbar__divider" /><div className="profile-menu"><button className="profile-button" type="button" onClick={() => setProfileOpen(value => !value)} aria-expanded={profileOpen}><span className="profile-avatar">{initials}</span><span className="profile-copy"><strong>{displayName}</strong><span>{profile?.plan || 'free'} plan</span></span><Icon name="arrowDown" size={13} /></button>{profileOpen && <div className="profile-dropdown"><button type="button" onClick={() => navigate('/settings')}><Icon name="settings" size={14} />Settings</button><button type="button" onClick={handleSignOut}><Icon name="logout" size={14} />Sign out</button></div>}</div></div></header><main className="app-content">{children}</main></div>
  </div>;
}
