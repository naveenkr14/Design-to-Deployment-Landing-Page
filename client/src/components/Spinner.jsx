export default function Spinner({ size = 24, color = 'var(--violet-bright)' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin .8s linear infinite' }} aria-label="Loading"><circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.5" strokeDasharray="42 14" strokeLinecap="round" /></svg>;
}
