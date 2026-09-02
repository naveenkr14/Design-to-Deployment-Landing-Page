import Icon from './Icon.jsx';

export function LogoMark({ small = false }) {
  return <span className={`logo-mark ${small ? 'logo-mark--small' : ''}`} aria-hidden="true"><span className="logo-mark__ring" /><span className="logo-mark__core" /><span className="logo-mark__spark" /></span>;
}

export function PageHeader({ eyebrow, title, description, actions, children }) {
  return <div className="page-header"><div>{eyebrow && <p className="eyebrow"><span className="eyebrow__dot" />{eyebrow}</p>}<h1>{title}</h1>{description && <p className="page-header__description">{description}</p>}</div>{(actions || children) && <div className="page-header__actions">{actions || children}</div>}</div>;
}

export function Alert({ children, tone = 'error' }) {
  return <div className={`alert alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'}><Icon name={tone === 'success' ? 'circleCheck' : tone === 'warning' ? 'clock' : 'activity'} size={17} /><span>{children}</span></div>;
}

export function MetricCard({ icon, label, value, detail, tone = 'violet' }) {
  return <div className="metric-card"><div className={`metric-card__icon metric-card__icon--${tone}`}><Icon name={icon} size={17} /></div><div className="metric-card__label">{label}</div><div className="metric-card__value">{value}</div>{detail && <div className="metric-card__detail">{detail}</div>}</div>;
}

export function EmptyState({ icon = 'folder', title, description, action }) {
  return <div className="empty-state"><div className="empty-state__icon"><Icon name={icon} size={22} /></div><h3>{title}</h3>{description && <p>{description}</p>}{action}</div>;
}

export function Skeleton({ className = '' }) { return <span className={`skeleton ${className}`} aria-label="Loading" />; }
