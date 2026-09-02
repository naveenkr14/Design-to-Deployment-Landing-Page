import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Spinner from '../components/Spinner.jsx';
import Icon from '../components/Icon.jsx';
import { Alert, PageHeader } from '../components/UI.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../App.jsx';

const PLANS = [
  { id: 'solo', name: 'Solo', price: '$9', tagline: 'For independent designers flying solo.', features: ['5 active projects', 'Unlimited client feedback', 'Full approval history', 'Pinned comments on files', 'Email notifications'] },
  { id: 'studio', name: 'Studio', price: '$29', tagline: 'For small studios juggling multiple clients.', features: ['Unlimited active projects', 'Up to 5 team members', 'Custom review deadlines', 'Priority support', 'Everything in Solo'], highlighted: true },
];

export default function Pricing() {
  const { session } = useAuth(); const navigate = useNavigate(); const [loading, setLoading] = useState(''); const [err, setErr] = useState('');
  async function handleSubscribe(planId) { if (!session) { navigate('/signup'); return; } setErr(''); setLoading(planId); try { const { url } = await api.post(`/stripe/checkout?plan=${planId}`, {}); window.location.href = url; } catch (e) { setErr(e.message || 'Could not start checkout.'); setLoading(''); } }
  return <Layout><div className="page"><PageHeader eyebrow="Plans that scale with your workflow" title="Simple, honest pricing." description="Start free, then choose the amount of focus your client work needs. No per-seat surprises." /><div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24, color: 'var(--text-subtle)', fontSize: 11 }}><Icon name="shield" size={15} />Every plan includes a 14-day free trial. No credit card required.</div>{err && <div style={{ marginBottom: 18 }}><Alert>{err}</Alert></div>}<div className="pricing-grid">{PLANS.map(plan => <div key={plan.id} className={`panel price-card ${plan.highlighted ? 'price-card--highlight' : ''}`}>{plan.highlighted && <span className="price-card__tag">Most popular</span>}<h2>{plan.name}</h2><div className="price-card__price"><strong>{plan.price}</strong><span>/ month</span></div><p className="price-card__description">{plan.tagline}</p><ul className="feature-list">{plan.features.map(feature => <li key={feature}><Icon name="check" size={14} />{feature}</li>)}</ul><button className="btn btn-primary btn-full" onClick={() => handleSubscribe(plan.id)} disabled={loading === plan.id}>{loading === plan.id ? <Spinner size={15} color="#fff" /> : <>Start free trial <Icon name="arrowRight" size={14} /></>}</button></div>)}</div></div></Layout>;
}
