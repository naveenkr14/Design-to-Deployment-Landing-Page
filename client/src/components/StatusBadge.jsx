const LABELS = { waiting: 'Waiting on Client', ready: 'Feedback Ready', approved: 'Approved', free: 'Free', solo: 'Solo', studio: 'Studio' };
export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{LABELS[status] ?? status}</span>;
}
