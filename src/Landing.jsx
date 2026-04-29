import { useEffect, useRef, useState } from 'react';
import {
  Shield, Zap, ArrowUpRight, ArrowDownRight, TrendingUp,
  Lock, Globe, ChevronRight, Wallet, BarChart3, Send, Star
} from 'lucide-react';

/* ── responsive hook ── */
function useMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return mobile;
}

/* ── animated counter ── */
function useCounter(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let frame;
    const startTime = performance.now();
    const tick = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(ease * target));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, start]);
  return val;
}

/* ── intersection helper ── */
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── hero card visual ── */
function HeroCard() {
  return (
    <div className="relative w-full max-w-sm mx-auto select-none" style={{ perspective: '1000px' }}>
      {/* main wallet card */}
      <div className="hero-card w-full" style={{ minHeight: 200 }}>
        <div className="absolute inset-0 opacity-20"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#22d3ee)', borderRadius: 'inherit' }} />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Available Balance
              </p>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 36, fontWeight: 700, lineHeight: 1.1, marginTop: 4 }}>
                ₹42,500<span style={{ fontSize: 20, opacity: 0.5 }}>.00</span>
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 10 }}>
              <Wallet size={22} />
            </div>
          </div>
          <div className="flex gap-4">
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px' }}>
              <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 2 }}>Abhinav B.</p>
              <p style={{ fontSize: 13, fontWeight: 600 }}>**** 4821</p>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: 13, color: '#34d399', fontWeight: 600 }}>Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* floating notification pills */}
      <div className="notif-pill" style={{ position: 'absolute', top: -18, right: -20, animationDelay: '0s' }}>
        <ArrowDownRight size={14} />
        +₹15,000 received
      </div>
      <div className="notif-pill notif-pill-debit" style={{ position: 'absolute', bottom: -14, left: -16, animationDelay: '1.5s' }}>
        <Send size={13} />
        ₹850 sent to Tanishka
      </div>
    </div>
  );
}

/* ── stat item ── */
function StatItem({ label, value, suffix = '', prefix = '', inView }) {
  const count = useCounter(value, 1600, inView);
  return (
    <div className="stat-card">
      <div className="stat-number">{prefix}{count.toLocaleString('en-IN')}{suffix}</div>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 6, fontWeight: 500 }}>{label}</p>
    </div>
  );
}

/* ── feature card ── */
function FeatureCard({ icon, title, desc, gradient, delay = 0 }) {
  return (
    <div className="feature-card fade-in" style={{ animationDelay: `${delay}s` }}>
      <div className="feature-icon" style={{ background: gradient }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.3px' }}>{title}</h3>
      <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, fontSize: 14 }}>{desc}</p>
    </div>
  );
}

/* ── step item ── */
function Step({ num, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div style={{
        minWidth: 44, height: 44, borderRadius: '50%',
        background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, fontWeight: 700, color: '#a78bfa', flexShrink: 0
      }}>{num}</div>
      <div>
        <h4 style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{title}</h4>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.65 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN LANDING COMPONENT
══════════════════════════════════════════════════════ */
export default function Landing({ onGetStarted }) {
  const [statsRef, statsInView] = useInView();
  const isMobile = useMobile();

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>

      {/* ── mesh background ── */}
      <div className="mesh-bg"><div className="orb3" /></div>

      {/* ════════ NAVBAR ════════ */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={20} color="#1e0b4b" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>MyWallet</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={onGetStarted}
            className="btn-ghost"
            style={{ padding: isMobile ? '8px 14px' : '9px 20px', fontSize: 13 }}
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="btn-purple"
            style={{ padding: isMobile ? '8px 14px' : '9px 20px', fontSize: 13 }}
          >
            {isMobile ? 'Start →' : 'Get Started →'}
          </button>
        </div>
      </nav>

      {/* ════════ HERO ════════ */}
      <section className="landing-hero" style={{ paddingTop: isMobile ? 90 : 100, paddingBottom: isMobile ? 60 : 80 }}>
        <div style={{
          maxWidth: 1100, width: '100%',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 48 : 80,
          alignItems: 'center'
        }}>

          {/* left */}
          <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
            <div className="hero-badge" style={{ marginBottom: 28, display: 'inline-flex' }}>
              <div className="dot" />
              Secure · Fast · Intelligent
            </div>

            <h1 className="fade-in" style={{
              fontSize: isMobile ? 'clamp(36px,10vw,52px)' : 'clamp(40px,5vw,68px)',
              fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 20
            }}>
              Your Money,<br />
              <span className="gradient-text">Reimagined.</span>
            </h1>

            <p className="fade-in" style={{
              fontSize: isMobile ? 15 : 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7,
              maxWidth: isMobile ? '100%' : 460, marginBottom: 36, animationDelay: '0.1s'
            }}>
              Send money instantly, track your spending with AI-powered insights,
              and stay protected with real-time fraud detection — all in one place.
            </p>

            <div className="fade-in" style={{
              display: 'flex', gap: 12, flexWrap: 'wrap', animationDelay: '0.2s',
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
              <button onClick={onGetStarted} className="btn-primary" style={{ fontSize: isMobile ? 15 : 16, padding: isMobile ? '14px 28px' : '16px 32px', borderRadius: 16 }}>
                Start for Free
              </button>
              <button onClick={onGetStarted} className="btn-ghost" style={{ fontSize: isMobile ? 15 : 16, padding: isMobile ? '14px 22px' : '16px 28px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                Sign In <ChevronRight size={18} />
              </button>
            </div>

            {/* trust badges */}
            <div className="fade-in" style={{
              display: 'flex', gap: isMobile ? 16 : 24, marginTop: 40, alignItems: 'center',
              animationDelay: '0.3s', flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
              {[
                { icon: <Shield size={16} />, text: 'Bank-grade Security' },
                { icon: <Zap size={16} />, text: 'Instant Transfers' },
                { icon: <Lock size={16} />, text: 'JWT Auth' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500 }}>
                  <span style={{ color: '#a78bfa' }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* right — hero card */}
          <div className="fade-in" style={{ animationDelay: '0.15s' }}>
            <HeroCard />
          </div>
        </div>
      </section>

      {/* ════════ STATS ════════ */}
      <section ref={statsRef} style={{ padding: isMobile ? '40px 20px' : '60px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 12 }} className="stagger">
          <StatItem label="Registered Users"     value={12400} suffix="+" inView={statsInView} />
          <StatItem label="Transactions / Day"   value={38000} suffix="+" inView={statsInView} />
          <StatItem label="Fraud Blocked"        value={99.8}  suffix="%" inView={statsInView} prefix="" />
          <StatItem label="Avg Response (ms)"    value={42}    inView={statsInView} />
        </div>
      </section>

      <hr className="section-divider" style={{ margin: isMobile ? '10px 20px' : '20px 40px' }} />

      {/* ════════ FEATURES ════════ */}
      <section style={{ padding: isMobile ? '40px 20px' : '60px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 36 : 56 }}>
          <p style={{ color: '#a78bfa', fontWeight: 600, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            Why MyWallet
          </p>
          <h2 style={{ fontSize: 'clamp(24px,4vw,44px)', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            Built for the <span className="gradient-text">modern era</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 16 }}>
          <FeatureCard
            delay={0.05}
            icon={<Shield size={24} color="#a78bfa" />}
            title="Real-Time Fraud Detection"
            desc="Multi-rule engine detects velocity attacks, large-amount anomalies, unusual hours, and repeat recipient patterns — before any money moves."
            gradient="rgba(124,58,237,0.2)"
          />
          <FeatureCard
            delay={0.10}
            icon={<Zap size={24} color="#22d3ee" />}
            title="Instant P2P Transfers"
            desc="ACID-compliant transfers with SERIALIZABLE isolation and optimistic locking ensure your money never gets lost — even under concurrent load."
            gradient="rgba(34,211,238,0.15)"
          />
          <FeatureCard
            delay={0.15}
            icon={<BarChart3 size={24} color="#10b981" />}
            title="Expense Intelligence"
            desc="Automated monthly summaries, category breakdowns, and net savings tracking give you complete visibility over your spending patterns."
            gradient="rgba(16,185,129,0.15)"
          />
          <FeatureCard
            delay={0.20}
            icon={<Lock size={24} color="#f59e0b" />}
            title="JWT Authentication"
            desc="Spring Security + JWT with BCrypt-hashed passwords. Role-based access control and stateless auth keep your sessions secure."
            gradient="rgba(245,158,11,0.15)"
          />
          <FeatureCard
            delay={0.25}
            icon={<TrendingUp size={24} color="#a78bfa" />}
            title="Smart Caching"
            desc="Redis-ready caching layer slashes DB load on balance queries and analytics. Response times drop from 200 ms to under 5 ms."
            gradient="rgba(124,58,237,0.15)"
          />
          <FeatureCard
            delay={0.30}
            icon={<Globe size={24} color="#22d3ee" />}
            title="OpenAPI Docs"
            desc="Every endpoint is auto-documented via Swagger/OpenAPI 3. Explore and test the API live at /swagger-ui without writing a line of code."
            gradient="rgba(34,211,238,0.12)"
          />
        </div>
      </section>

      <hr className="section-divider" style={{ margin: isMobile ? '10px 20px' : '20px 40px' }} />

      {/* ════════ HOW IT WORKS ════════ */}
      <section style={{ padding: isMobile ? '30px 20px 60px' : '40px 40px 80px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 48 }}>
          <h2 style={{ fontSize: 'clamp(22px,3.5vw,40px)', fontWeight: 800, letterSpacing: '-1.2px' }}>
            Up and running in <span className="gradient-text">3 steps</span>
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }} className="stagger">
          <Step num="01" title="Create your free account" desc="Register with your name and email. Your wallet is created instantly with ₹0 balance and full security enabled." />
          <Step num="02" title="Add funds to your wallet" desc="Top up using the simulated bank transfer. Funds appear in your wallet immediately — ready to spend or send." />
          <Step num="03" title="Send, track & analyse" desc="Transfer money to any registered user, view real-time transaction history, and get automated monthly spending insights." />
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(124,58,237,0.12), transparent)',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 20 }}>
            {[...Array(5)].map((_,i) => <Star key={i} size={20} fill="#f59e0b" color="#f59e0b" />)}
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, letterSpacing: '-2px', marginBottom: 16 }}>
            Ready to take control<br />of your <span className="gradient-text">finances?</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
            Join thousands of users managing their money smarter with MyWallet.
          </p>
          <button onClick={onGetStarted} className="btn-purple" style={{ fontSize: 17, padding: '18px 48px', borderRadius: 18 }}>
            Get Started — It's Free
          </button>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: isMobile ? '24px 20px' : '28px 40px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isMobile ? 8 : 0,
        color: 'rgba(255,255,255,0.35)', fontSize: 13,
        textAlign: isMobile ? 'center' : 'left'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Wallet size={16} color="rgba(255,255,255,0.35)" />
          <span>MyWallet — Digital Wallet &amp; Expense Intelligence</span>
        </div>
        <span>Built with Spring Boot + React</span>
      </footer>
    </div>
  );
}
