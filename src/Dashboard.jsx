import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, ChevronRight, RefreshCw, TrendingUp, Send, Plus, QrCode, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMe, getTransactions } from './api';
import AddFunds from './AddFunds';
import ReceiveMoney from './ReceiveMoney';

/* ── animated counter ── */
function useCountUp(target, duration = 900, trigger = true) {
  const [val, setVal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (!trigger || target == null) return;
    const from = prev.current;
    const diff = target - from;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(from + diff * ease);
      if (p < 1) requestAnimationFrame(tick);
      else { setVal(target); prev.current = target; }
    };
    requestAnimationFrame(tick);
  }, [target, duration, trigger]);
  return val;
}

function formatINR(n) {
  if (n == null) return '0.00';
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function formatINRFull(n) {
  if (n == null) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}
function timeAgo(iso) {
  const d = new Date(iso), now = new Date(), s = Math.floor((now - d) / 1000);
  if (s < 60)    return 'Just now';
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const days = Math.floor(s / 86400);
  return days === 1 ? 'Yesterday' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/* ── sparkline chart ── */
function Sparkline({ data = [] }) {
  if (data.length < 2) return null;
  const W = 200, H = 60;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * H * 0.85 - H * 0.075;
    return `${x},${y}`;
  }).join(' ');
  const areaPath = `M0,${H} L${pts.split(' ').map(p => p).join(' L')} L${W},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 60, overflow: 'visible' }}>
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
          <stop offset="100%" stopColor="rgba(16,185,129,0)" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#spark-fill)" />
      <polyline points={pts} fill="none" stroke="#10b981" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── quick action button ── */
function QuickAction({ icon, label, color, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '14px 20px', borderRadius: 16, border: '1px solid',
        fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        ...color,
      }}
    >
      {icon} <span className="hide-mobile">{label}</span>
    </button>
  );
}

/* ── transaction row ── */
function TxRow({ tx, onClick, delay = 0 }) {
  const isCredit = tx.type === 'credit';
  return (
    <div onClick={onClick} className="tx-item fade-in" style={{ animationDelay: `${delay}s` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: isCredit ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)',
          color: isCredit ? '#10b981' : 'rgba(255,255,255,0.7)',
        }}>
          {isCredit ? <ArrowDownRight size={22} /> : <ArrowUpRight size={22} />}
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: 15 }} className="truncate max-w-[140px] sm:max-w-none">{tx.title}</p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 2 }}>
            {tx.date}
            <span className="hide-mobile">
              <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 6 }}>{tx.category}</span>
            </span>
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: isCredit ? '#10b981' : '#fff' }}>{tx.amount}</span>
        <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.2)' }} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════════ */
export default function Dashboard({ onViewChange, onViewTx }) {
  const [user, setUser] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const balance = useCountUp(user?.balance, 1000, ready);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [me, history] = await Promise.all([getMe(), getTransactions()]);
      setUser(me); setTxs(history.slice(0, 5));
      setTimeout(() => setReady(true), 100);
    } catch (e) { 
      setError(e.message); 
      // App.jsx polling will handle the logout, but we can set a state here if needed
    }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const recentTxs = txs.map(tx => ({
    id: tx.id,
    title: tx.description || (tx.type === 'CREDIT' ? 'Received' : 'Sent'),
    category: tx.category,
    date: timeAgo(tx.timestamp),
    amount: `${tx.type === 'CREDIT' ? '+' : '-'}₹${formatINR(tx.amount)}`,
    type: tx.type === 'CREDIT' ? 'credit' : 'debit',
    rawTx: tx,
  }));

  // sparkline: last 6 balanceAfter values
  const sparkData = [...txs].reverse().map(t => parseFloat(t.balanceAfter || 0)).filter(Boolean);

  // calc monthly totals
  const totalIn  = txs.filter(t => t.type === 'CREDIT').reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalOut = txs.filter(t => t.type === 'DEBIT' ).reduce((s, t) => s + parseFloat(t.amount), 0);

  return (
    <>
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 40 }}>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 16, padding: '14px 20px', color: '#f87171', fontSize: 14 }}>
            {error} — <button onClick={load} style={{ background: 'none', border: 'none', color: '#f87171', textDecoration: 'underline', cursor: 'pointer' }}>Retry</button>
          </div>
        )}

        {/* ── grid: balance + stats ── */}
        <div className="responsive-grid" style={{ marginBottom: 40 }}>

          {/* balance card */}
          <div className="glass-card" style={{ padding: 'clamp(24px, 4vw, 36px)', position: 'relative', overflow: 'hidden', minHeight: 280 }}>
            {/* background glow */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260,
              background: 'radial-gradient(circle, rgba(124,58,237,0.2), transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, position: 'relative' }}>
              <Activity size={18} style={{ color: '#10b981' }} />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Main Balance</span>
            </div>

            {loading ? (
              <div className="skeleton" style={{ height: 72, width: 220, marginBottom: 16 }} />
            ) : (
              <div className="balance-display" style={{ fontSize: 'clamp(40px,5vw,64px)', marginBottom: 8, position: 'relative' }}>
                <span style={{ fontSize: '0.5em', verticalAlign: 'middle', opacity: 0.7, marginRight: 4 }}>₹</span>
                {formatINR(balance)}
              </div>
            )}

            {/* sparkline */}
            <div style={{ marginBottom: 24, opacity: 0.8 }} className="hide-mobile">
              <Sparkline data={sparkData} />
            </div>

            {/* actions */}
            <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', position: 'relative', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
              <QuickAction
                icon={<Plus size={18} />} label="Top Up"
                color={{ background: '#fff', color: '#1e0b4b', borderColor: 'transparent' }}
                onClick={() => setShowAddFunds(true)}
              />
              <QuickAction
                icon={<QrCode size={18} />} label="My QR"
                color={{ background: 'rgba(255,255,255,0.06)', color: '#fff', borderColor: 'rgba(255,255,255,0.15)' }}
                onClick={() => setShowQR(true)}
              />
              <QuickAction
                icon={<Send size={18} />} label="Send"
                color={{ background: 'rgba(124,58,237,0.15)', color: '#fff', borderColor: 'rgba(124,58,237,0.35)' }}
                onClick={() => onViewChange('transfer')}
              />
            </div>
          </div>

          {/* side stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="glass-card" style={{ padding: '22px 24px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <ArrowDownRight size={16} style={{ color: '#10b981' }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>In (recent)</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981', letterSpacing: '-0.5px' }}>
                {loading ? <div className="skeleton" style={{ height: 32, width: 100 }} /> : formatINRFull(totalIn)}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '22px 24px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <ArrowUpRight size={16} style={{ color: '#a78bfa' }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Out (recent)</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>
                {loading ? <div className="skeleton" style={{ height: 32, width: 100 }} /> : formatINRFull(totalOut)}
              </div>
            </div>
            <button onClick={() => onViewChange('analytics')}
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: 18, padding: '16px 20px', color: '#a78bfa', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s', fontSize: 14 }}>
              <TrendingUp size={18} /> View Analytics
            </button>
          </div>
        </div>

        {/* ── recent transactions ── */}
        <div className="glass-card" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>Recent Transactions</h3>
            <button onClick={() => onViewChange('history')}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontWeight: 600, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.2s' }}>
              View All <ChevronRight size={16} />
            </button>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 64 }} />)}
            </div>
          ) : recentTxs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)' }}>
              <Activity size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
              <p style={{ fontWeight: 600, marginBottom: 6 }}>No transactions yet</p>
              <p style={{ fontSize: 13 }}>Add funds or send money to get started</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentTxs.map((tx, i) => (
                <TxRow key={tx.id} tx={tx} onClick={() => onViewTx(tx)} delay={i * 0.06} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {(showAddFunds || showQR) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowAddFunds(false); setShowQR(false); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 no-scrollbar"
            >
              <button 
                onClick={() => { setShowAddFunds(false); setShowQR(false); }}
                className="absolute top-6 right-6 z-20 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all"
              >
                <X size={24} />
              </button>
              
              {showAddFunds && <AddFunds onViewChange={(v) => { if(v==='dashboard') { setShowAddFunds(false); load(); } }} />}
              {showQR && <ReceiveMoney />}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}