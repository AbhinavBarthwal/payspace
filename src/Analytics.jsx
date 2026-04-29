import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { getAnalytics } from './api';

const PALETTE = ['#7c3aed','#22d3ee','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6'];

function fmtINR(v) {
  return new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(v||0);
}

/* ── Donut chart ── */
function DonutChart({ data, total }) {
  const R = 72, C = 2 * Math.PI * R;
  let cumulative = 0;
  const slices = data.map((d, i) => {
    const pct = total > 0 ? parseFloat(d.total) / total : 0;
    const offset = C * (1 - cumulative);
    const dash   = C * pct;
    cumulative  += pct;
    return { ...d, dash, offset, color: PALETTE[i % PALETTE.length] };
  });
  return (
    <div style={{ position:'relative', width:180, height:180, flexShrink:0 }}>
      <svg viewBox="0 0 160 160" style={{ width:180, height:180, transform:'rotate(-90deg)' }}>
        {/* track */}
        <circle cx={80} cy={80} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={22} />
        {slices.map((s,i) => (
          <circle key={i} cx={80} cy={80} r={R} fill="none"
            stroke={s.color} strokeWidth={22}
            strokeDasharray={`${s.dash} ${C - s.dash}`}
            strokeDashoffset={s.offset}
            style={{ transition:`stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1) ${i*0.1}s` }}
          />
        ))}
      </svg>
      {/* center text */}
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', textAlign:'center' }}>
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', lineHeight:1.2 }}>Total<br/>Spent</p>
        <p style={{ fontSize:18, fontWeight:800, marginTop:4, letterSpacing:'-0.5px' }}>{fmtINR(total)}</p>
      </div>
    </div>
  );
}

/* ── horizontal bar ── */
function CatBar({ label, total, max, color, i }) {
  const pct = max > 0 ? (parseFloat(total) / max) * 100 : 0;
  return (
    <div className="fade-in" style={{ animationDelay:`${i*0.08}s` }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:color, boxShadow:`0 0 8px ${color}88`, flexShrink:0 }} />
          <span style={{ fontWeight:600, fontSize:14 }}>{label}</span>
        </div>
        <span style={{ fontWeight:700, fontSize:14, color:'rgba(255,255,255,0.85)' }}>{fmtINR(total)}</span>
      </div>
      <div style={{ height:8, borderRadius:4, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
        <div className="chart-bar" style={{
          height:'100%', width:`${pct}%`, borderRadius:4,
          background:`linear-gradient(90deg, ${color}aa, ${color})`,
          boxShadow:`0 0 12px ${color}55`,
          animationDelay:`${i*0.1}s`,
        }} />
      </div>
    </div>
  );
}

/* ── summary row ── */
function SummaryRow({ label, value, color, big }) {
  return (
    <div style={{
      display:'flex', justifyContent:'space-between', alignItems:'center',
      padding: big ? '20px 24px' : '16px 20px',
      borderRadius:18,
      background: big ? 'rgba(124,58,237,0.1)' : 'var(--bg-surface)',
      border:`1px solid ${big ? 'rgba(124,58,237,0.25)' : 'var(--border)'}`,
    }}>
      <span style={{ fontWeight:600, fontSize: big ? 16 : 14, color: big ? '#fff' : 'rgba(255,255,255,0.6)',
        textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>
      <span style={{ fontWeight:800, fontSize: big ? 28 : 20, color, letterSpacing:'-0.5px' }}>{value}</span>
    </div>
  );
}

export default function Analytics() {
  const [offset, setOffset]   = useState(0);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setData(await getAnalytics(offset)); }
    catch(e) { setError(e.message); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, [offset]);

  const cats    = data?.categoryBreakdown || [];
  const totalOut = parseFloat(data?.totalOutgoing || 0);
  const totalIn  = parseFloat(data?.totalIncoming || 0);
  const net      = parseFloat(data?.netSavings || 0);
  const maxCat   = Math.max(...cats.map(c => parseFloat(c.total)), 1);

  const fmtMonth = (s) => {
    if (!s) return '…';
    const [y,m] = s.split('-');
    return new Date(+y, +m-1).toLocaleDateString('en-IN', { month:'long', year:'numeric' });
  };

  return (
    <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:20, paddingBottom:40 }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600 }}>{fmtMonth(data?.month)}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setOffset(o => o+1)}
            style={{ padding:8, borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-surface-md)', color:'#fff', cursor:'pointer', display:'flex' }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.6)', fontWeight:700, minWidth:80, textAlign:'center' }}>
            {offset === 0 ? 'This Month' : `${offset}mo ago`}
          </span>
          <button onClick={() => setOffset(o => Math.max(0,o-1))} disabled={offset===0}
            style={{ padding:8, borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-surface-md)', color:'#fff', cursor:'pointer', display:'flex', opacity:offset===0?0.35:1 }}>
            <ChevronRight size={16} />
          </button>
          <button onClick={load}
            style={{ padding:8, borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-surface-md)', color:'#fff', cursor:'pointer', display:'flex' }}>
            <RefreshCw size={16} style={{ animation:loading?'spin 0.8s linear infinite':'none' }} />
          </button>
        </div>
      </div>

      {error && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:16, padding:'12px 16px', color:'#f87171', fontSize:14 }}>{error}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:20 }}>

        {/* ── category breakdown ── */}
        <div className="glass-card" style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
            <h3 style={{ fontWeight:700, fontSize:18, letterSpacing:'-0.3px' }}>Spending by Category</h3>
            <div style={{ padding:10, borderRadius:12, background:'var(--bg-surface-md)', display:'flex' }}>
              <BarChart3 size={18} style={{ color:'rgba(255,255,255,0.6)' }} />
            </div>
          </div>

          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:48 }} />)}
            </div>
          ) : cats.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.35)' }}>
              <BarChart3 size={36} style={{ margin:'0 auto 12px', display:'block', opacity:0.3 }} />
              <p>No spending this month</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexWrap: 'wrap', gap:32, alignItems:'center', justifyContent: 'center' }}>
              <DonutChart data={cats} total={totalOut} />
              <div style={{ flex: '1 1 240px', display:'flex', flexDirection:'column', gap:14 }}>
                {cats.map((c,i) => (
                  <CatBar key={c.category} label={c.category} total={c.total} max={maxCat} color={PALETTE[i%PALETTE.length]} i={i} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── monthly summary ── */}
        <div className="glass-card" style={{ padding:'28px 32px', display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <h3 style={{ fontWeight:700, fontSize:18, letterSpacing:'-0.3px' }}>Monthly Summary</h3>
            <div style={{ padding:10, borderRadius:12, background:'var(--bg-surface-md)', display:'flex' }}>
              <TrendingUp size={18} style={{ color:'rgba(255,255,255,0.6)' }} />
            </div>
          </div>
          {loading ? (
            [1,2,3].map(i => <div key={i} className="skeleton" style={{ height:64 }} />)
          ) : (<>
            <SummaryRow label="Total Incoming" value={`+${fmtINR(totalIn)}`} color="#10b981" />
            <SummaryRow label="Total Outgoing" value={`-${fmtINR(totalOut)}`} color="rgba(255,255,255,0.85)" />
            <SummaryRow label="Net Savings" value={`${net>=0?'':'-'}${fmtINR(Math.abs(net))}`} color={net>=0?'#a78bfa':'#f87171'} big />
          </>)}
        </div>
      </div>
    </div>
  );
}