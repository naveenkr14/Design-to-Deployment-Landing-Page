import { Link } from 'react-router-dom';
import { useAuth } from '../App.jsx';

function LoopMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="13" stroke="#1F6F63" strokeWidth="2.5"/>
      <circle cx="16" cy="16" r="6" fill="#1F6F63" opacity="0.18"/>
      <circle cx="23" cy="9" r="3.5" fill="#E8A33D"/>
    </svg>
  );
}

export default function Landing() {
  const { session } = useAuth();
  const ctaHref = session ? '/dashboard' : '/signup';

  return (
    <div style={{ background:'var(--mist)', minHeight:'100vh' }}>
      {/* NAV */}
      <header style={{ position:'sticky', top:0, zIndex:100, background:'var(--mist)', borderBottom:'var(--sage-line)', paddingBlock:'1rem' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'2rem' }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:'.55rem', textDecoration:'none', color:'var(--ink)' }}>
            <LoopMark />
            <span style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'1.3rem' }}>Loop</span>
          </Link>
          <nav style={{ display:'flex', alignItems:'center', gap:'2rem' }}>
            <a href="#product" style={{ fontSize:'.9375rem', fontWeight:500, opacity:.75, color:'var(--ink)' }}>Product</a>
            <a href="#how-it-works" style={{ fontSize:'.9375rem', fontWeight:500, opacity:.75, color:'var(--ink)' }}>How it works</a>
            <Link to="/pricing" style={{ fontSize:'.9375rem', fontWeight:500, opacity:.75, color:'var(--ink)' }}>Pricing</Link>
            <Link to={ctaHref} className="btn btn-primary btn-sm">Start free trial</Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{ paddingBlock:'clamp(3.5rem,8vw,7rem) clamp(3rem,6vw,5.5rem)' }} id="product">
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.05fr', gap:'clamp(2rem,5vw,5rem)', alignItems:'center' }}>
            <div>
              <p style={{ display:'inline-flex', alignItems:'center', gap:'.5rem', fontSize:'.8125rem', fontWeight:600, letterSpacing:'.07em', textTransform:'uppercase', color:'var(--teal)', marginBottom:'1.25rem' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--amber)', display:'inline-block' }}></span>
                For freelance designers &amp; small studios
              </p>
              <h1 style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'clamp(2.4rem,5vw,3.75rem)', lineHeight:1.1, letterSpacing:'-.025em', color:'var(--ink)', marginBottom:'1.25rem', maxWidth:'16ch' }}>
                Client feedback, out of your inbox.
              </h1>
              <p style={{ fontSize:'clamp(1rem,1.5vw,1.125rem)', color:'#4a5254', lineHeight:1.65, maxWidth:'46ch', marginBottom:'2.25rem' }}>
                Loop turns scattered emails and WhatsApp screenshots into one clear approval thread &#8212; pinned to the exact spot on the file.
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
                <Link to={ctaHref} className="btn btn-primary" style={{ fontSize:'1rem', padding:'.8rem 1.75rem' }}>Start free trial</Link>
                <a href="#how-it-works" style={{ color:'var(--teal)', fontWeight:500, display:'flex', alignItems:'center', gap:'.3rem' }}>
                  See how it works
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
              </div>
            </div>
            {/* Mockup */}
            <div style={{ background:'var(--white)', border:'var(--sage-line)', borderRadius:10, overflow:'hidden' }} role="img" aria-label="Product mockup">
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 14px', background:'#f0efeb', borderBottom:'var(--sage-line)' }}>
                <span style={{ width:10, height:10, borderRadius:'50%', background:'#f4785a' }}></span>
                <span style={{ width:10, height:10, borderRadius:'50%', background:'var(--amber)' }}></span>
                <span style={{ width:10, height:10, borderRadius:'50%', background:'#56c263' }}></span>
                <div style={{ flex:1, background:'#e6e5e0', borderRadius:4, height:20, marginLeft:8, display:'flex', alignItems:'center', padding:'0 8px', fontSize:'.65rem', color:'#888' }}>app.loopfeedback.com/review/brand-id-v3</div>
              </div>
              <div style={{ padding:16 }}>
                <div style={{ background:'#e8e7e2', border:'1px solid #d4d3ce', borderRadius:6, height:180, position:'relative', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, padding:10 }}>
                  <div style={{ gridColumn:'1/-1', background:'var(--teal)', borderRadius:3, height:26, display:'flex', alignItems:'center', padding:'0 10px', gap:6 }}>
                    <div style={{ width:12, height:12, background:'var(--amber)', borderRadius:'50%', opacity:.85 }}></div>
                    <div style={{ display:'flex', gap:6, marginLeft:'auto' }}>{[1,2,3].map(i=><div key={i} style={{ width:20, height:4, background:'rgba(255,255,255,.3)', borderRadius:2 }}></div>)}</div>
                  </div>
                  <div style={{ background:'var(--white)', borderRadius:3 }}></div>
                  <div style={{ background:'var(--white)', borderRadius:3 }}></div>
                  <div style={{ position:'absolute', width:22, height:22, borderRadius:'50% 50% 50% 0', transform:'rotate(-45deg)', background:'var(--teal)', top:36, left:48, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 6px rgba(0,0,0,.18)' }}><span style={{ transform:'rotate(45deg)', fontSize:'.55rem', fontWeight:700, color:'#fff' }}>1</span></div>
                  <div style={{ position:'absolute', width:22, height:22, borderRadius:'50% 50% 50% 0', transform:'rotate(-45deg)', background:'var(--amber)', top:100, right:28, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 6px rgba(0,0,0,.18)' }}><span style={{ transform:'rotate(45deg)', fontSize:'.55rem', fontWeight:700, color:'#fff' }}>2</span></div>
                </div>
                <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:7 }}>
                  {[{col:'var(--teal)',n:'SM',text:'Can we make the logo a touch larger?'},{col:'var(--amber)',n:'You',text:'On it \u2014 uploading v4 shortly.'}].map((c,i)=>(
                    <div key={i} style={{ background:'#fafaf8', border:'var(--sage-line)', borderRadius:7, padding:'8px 10px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
                        <div style={{ width:22, height:22, borderRadius:'50%', background:c.col, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.55rem', fontWeight:700, color:'#fff' }}>{c.n}</div>
                        <div style={{ flex:1 }}><div style={{ fontSize:'.65rem', fontWeight:600 }}>{c.n === 'SM' ? 'Sarah M.' : 'You'}</div><div style={{ fontSize:'.575rem', color:'#8a9194' }}>Today</div></div>
                      </div>
                      <p style={{ fontSize:'.675rem', color:'#4a5254', lineHeight:1.4 }}>{c.text}</p>
                    </div>
                  ))}
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#ecf7f0', border:'1px solid #a8d9b5', borderRadius:20, padding:'4px 10px', fontSize:'.65rem', fontWeight:600, color:'#1a6632' }}>
                    <div style={{ width:13, height:13, background:'#2e8b4f', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <div style={{ width:6, height:4, borderLeft:'1.5px solid #fff', borderBottom:'1.5px solid #fff', transform:'rotate(-45deg) translate(.5px,-.5px)' }}></div>
                    </div>
                    Approved by Sarah M. &bull; 10:42 AM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ borderTop:'var(--sage-line)', paddingBlock:'clamp(4rem,8vw,7rem)' }} id="how-it-works">
        <div className="container">
          <p style={{ fontSize:'.8125rem', fontWeight:600, letterSpacing:'.07em', textTransform:'uppercase', color:'var(--teal)', marginBottom:'.75rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--amber)', display:'inline-block' }}></span>How it works
          </p>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.85rem,4vw,2.75rem)', fontWeight:600, letterSpacing:'-.02em', marginBottom:'.75rem', maxWidth:'22ch', lineHeight:1.15 }}>Three steps. Zero confusion.</h2>
          <p style={{ fontSize:'1.0625rem', color:'var(--text-muted)', maxWidth:'52ch', lineHeight:1.65, marginBottom:'3.5rem' }}>A client review shouldn&apos;t take three email threads.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'2rem', position:'relative' }}>
            {[
              { n:1, title:'Share the file', desc:'Drop in a design, PDF, or link. Your client opens it in the browser \u2014 no app, no login.' },
              { n:2, title:'Collect feedback', desc:'Comments pin directly to the spot. No more "top right, near the logo" guesswork.' },
              { n:3, title:'Get approval', desc:'One click marks a version approved, with a timestamp and the client\u2019s name.' },
            ].map((s,i)=>(
              <div key={i}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--white)', border:'var(--sage-line)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.5rem' }}>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', fontWeight:600, color:'var(--teal)' }}>{s.n}</span>
                </div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:600, marginBottom:'.5rem' }}>{s.title}</h3>
                <p style={{ fontSize:'.9375rem', color:'#4a5254', lineHeight:1.6, maxWidth:'28ch' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop:'var(--sage-line)', paddingBlock:'clamp(4rem,8vw,6.5rem)' }}>
        <div className="container">
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.85rem,3.5vw,2.6rem)', fontWeight:600, letterSpacing:'-.02em', maxWidth:'30ch', lineHeight:1.15, marginBottom:'1.75rem' }}>Give your clients one clear place to say yes.</h2>
          <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap' }}>
            <Link to={ctaHref} className="btn btn-primary" style={{ fontSize:'1rem', padding:'.8rem 1.75rem' }}>Start free trial</Link>
            <p style={{ fontSize:'.8125rem', color:'var(--text-subtle)' }}>14-day free trial &bull; No credit card required &bull; Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'var(--sage-line)', paddingBlock:'2.25rem' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1.5rem', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
            <LoopMark />
            <span style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'1rem', marginLeft:6 }}>Loop</span>
            <span style={{ fontSize:'.8125rem', color:'var(--text-subtle)', marginLeft:'1.25rem' }}>&copy; 2024 Loop. All rights reserved.</span>
          </div>
          <nav style={{ display:'flex', gap:'1.75rem', flexWrap:'wrap' }}>
            <a href="#product" style={{ fontSize:'.8125rem', color:'#6a7375', fontWeight:500 }}>Product</a>
            <a href="#how-it-works" style={{ fontSize:'.8125rem', color:'#6a7375', fontWeight:500 }}>How it works</a>
            <Link to="/pricing" style={{ fontSize:'.8125rem', color:'#6a7375', fontWeight:500 }}>Pricing</Link>
          </nav>
        </div>
      </footer>

      <style>{`
        @media(max-width:860px){
          #product .container > div { grid-template-columns:1fr!important; }
          #how-it-works .container > div { grid-template-columns:1fr!important; }
        }
        @media(max-width:720px){
          header nav a:not(.btn) { display:none; }
        }
      `}</style>
    </div>
  );
}
