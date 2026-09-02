import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Spinner from '../components/Spinner.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../App.jsx';

const PLANS = [
  { id:'solo', name:'Solo', price:'$9', tagline:'For independent designers flying solo.', features:['5 active projects','Unlimited client feedback','Full approval history','Pinned comments on files','Email notifications'] },
  { id:'studio', name:'Studio', price:'$29', tagline:'For small studios juggling multiple clients.', features:['Unlimited active projects','Up to 5 team members','Custom review deadlines','Priority support','Everything in Solo'], highlighted:true },
];

export default function Pricing() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState('');
  const [err, setErr] = useState('');

  async function handleSubscribe(planId) {
    if (!session) { navigate('/signup'); return; }
    setErr(''); setLoading(planId);
    try { const { url } = await api.post(`/stripe/checkout?plan=${planId}`, {}); window.location.href = url; }
    catch (e) { setErr(e.message || 'Could not start checkout.'); setLoading(''); }
  }

  return (
    <Layout>
      <section style={{ paddingBlock:'clamp(4rem,8vw,7rem)' }}>
        <div className="container">
          <p style={{ fontSize:'.8125rem', fontWeight:600, letterSpacing:'.07em', textTransform:'uppercase', color:'var(--teal)', marginBottom:'.75rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--amber)', display:'inline-block' }}></span>Pricing
          </p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3rem)', fontWeight:600, letterSpacing:'-.025em', marginBottom:'.75rem', maxWidth:'20ch', lineHeight:1.1 }}>Simple, honest pricing.</h1>
          <p style={{ fontSize:'1.0625rem', color:'var(--text-muted)', maxWidth:'50ch', lineHeight:1.65, marginBottom:'3.5rem' }}>No per-seat surprises. Pay for what you actually need.</p>

          {err && <div style={{ background:'#fdf0ef', border:'1px solid #f5c0bb', borderRadius:6, padding:'.75rem 1rem', marginBottom:'1.5rem', fontSize:'.875rem', color:'#c0392b', maxWidth:600 }}>{err}</div>}

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1.5rem', maxWidth:780 }}>
            {PLANS.map(plan => (
              <div key={plan.id} className="card" style={{ padding:'2rem', position:'relative', border: plan.highlighted ? '2px solid var(--teal)' : 'var(--sage-line)' }}>
                {plan.highlighted && <span style={{ position:'absolute', top:-13, left:'1.75rem', background:'var(--teal)', color:'#fff', fontSize:'.7rem', fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase', borderRadius:10, padding:'3px 10px' }}>Most popular</span>}
                <p style={{ fontSize:'.8125rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--teal)', marginBottom:'.5rem' }}>{plan.name}</p>
                <div style={{ display:'flex', alignItems:'baseline', gap:'.25rem', marginBottom:'.25rem' }}>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:'2.5rem', fontWeight:600, letterSpacing:'-.03em' }}>{plan.price}</span>
                  <span style={{ fontSize:'.875rem', color:'var(--text-muted)' }}>/mo</span>
                </div>
                <p style={{ fontSize:'.875rem', color:'var(--text-muted)', marginBottom:'1.75rem', paddingBottom:'1.5rem', borderBottom:'var(--sage-line)' }}>{plan.tagline}</p>
                <ul style={{ display:'flex', flexDirection:'column', gap:'.75rem', marginBottom:'1.75rem' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display:'flex', alignItems:'flex-start', gap:'.6rem', fontSize:'.9rem' }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--amber)', flexShrink:0, marginTop:'.45em' }}></span>{f}
                    </li>
                  ))}
                </ul>
                <button className="btn btn-primary btn-full" onClick={() => handleSubscribe(plan.id)} disabled={loading === plan.id}>
                  {loading === plan.id ? <Spinner size={16} color="#fff" /> : 'Start free trial'}
                </button>
              </div>
            ))}
          </div>
          <p style={{ marginTop:'1.5rem', fontSize:'.8125rem', color:'var(--text-muted)' }}>All plans include a 14-day free trial. No credit card required to start.</p>
        </div>
      </section>
    </Layout>
  );
}
