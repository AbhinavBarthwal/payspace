import { useState, useEffect } from 'react';
import { Send, Users, ShieldCheck, AlertTriangle, X, Search } from 'lucide-react';
import { transfer, searchUser, getMe } from './api';

function fmtINR(v) {
  return new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', minimumFractionDigits:2 }).format(v||0);
}

export default function Transfer({ onViewChange, initialEmail = '' }) {
  const [email,      setEmail]      = useState(initialEmail);
  const [amount,     setAmount]     = useState('');
  const [note,       setNote]       = useState('');
  const [processing, setProcessing] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState('');
  const [fraudWarn,  setFraudWarn]  = useState([]);
  const [recipient,  setRecipient]  = useState(null);
  const [searching,  setSearching]  = useState(false);
  const [balance,    setBalance]    = useState(null);
  const [result,     setResult]     = useState(null);

  useEffect(() => { getMe().then(u => setBalance(u.balance)).catch(()=>{}); }, []);

  const lookupRecipient = async () => {
    if (!email.includes('@')) return;
    setSearching(true); setRecipient(null); setError('');
    try {
      const r = await searchUser(email);
      if (r.found) setRecipient(r);
      else setError(r.reason || 'No user found with that email');
    } catch { /* silent */ }
    finally { setSearching(false); }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount'); return; }
    setError(''); setFraudWarn([]); setProcessing(true);
    try {
      const res = await transfer(email, parseFloat(amount), note);
      if (res.fraudWarning?.length) setFraudWarn(res.fraudWarning);
      setResult(res);
      setSuccess(true);
      setTimeout(() => onViewChange('dashboard'), 3500);
    } catch (err) {
      setError(err.message);
    } finally { setProcessing(false); }
  };

  if (success) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'70vh' }}>
      <div className="glass-card pop-in" style={{ padding:'56px 48px', textAlign:'center', maxWidth:440, width:'100%' }}>
        <div style={{ width:80, height:80, borderRadius:24, background:'rgba(16,185,129,0.15)',
          display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M8 20 L16 28 L32 12" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="100" strokeDashoffset="0"
              style={{ animation:'drawCheck 0.5s ease 0.2s both' }} />
          </svg>
        </div>
        <h2 style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.5px', marginBottom:10 }}>Transfer Sent!</h2>
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:16, lineHeight:1.6 }}>
          <strong style={{ color:'#fff' }}>{fmtINR(amount)}</strong> sent to{' '}
          <strong style={{ color:'#fff' }}>{recipient?.name || email}</strong>
        </p>
        {fraudWarn.length > 0 && (
          <div className="fraud-alert" style={{ marginTop:20, textAlign:'left' }}>
            <AlertTriangle size={16} style={{ color:'#fbbf24', flexShrink:0, marginTop:2 }} />
            <div>
              <p style={{ fontWeight:700, fontSize:13, color:'#fbbf24', marginBottom:4 }}>⚠ Fraud flags (transaction still processed)</p>
              {fraudWarn.map((f,i) => <p key={i} style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>{f}</p>)}
            </div>
          </div>
        )}
        <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13, marginTop:20 }}>Redirecting…</p>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:40, paddingBottom:40 }}>
      <div className="glass-card fade-in" style={{ padding: 'clamp(20px, 5vw, 44px)', width: '100%', maxWidth: 560 }}>

        <form onSubmit={handleTransfer} style={{ display:'flex', flexDirection:'column', gap:22 }}>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Recipient Email</label>
              {balance != null && <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>Balance: <strong style={{ color: '#fff' }}>{fmtINR(balance)}</strong></span>}
            </div>
            <div style={{ position:'relative' }}>
              <Users size={18} style={{ position:'absolute', left:16, top:16, color:'rgba(255,255,255,0.35)', pointerEvents:'none' }} />
              <input
                type="email" required value={email}
                onChange={e => { setEmail(e.target.value); setRecipient(null); setError(''); }}
                onBlur={lookupRecipient}
                placeholder="friend@example.com"
                className="glass-input"
                style={{ paddingLeft:48, paddingRight:46, paddingTop:14, paddingBottom:14, fontSize:15 }}
              />
              {searching && <Search size={16} style={{ position:'absolute', right:16, top:18, color:'rgba(255,255,255,0.35)', animation:'spin 0.8s linear infinite' }} />}
            </div>
            {recipient && (
              <div className="fade-in-fast" style={{ marginTop:10, display:'flex', alignItems:'center', gap:10,
                background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)',
                borderRadius:14, padding:'10px 14px' }}>
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${recipient.name}&backgroundColor=transparent`}
                  alt="" style={{ width:36, height:36, borderRadius:10 }} />
                <div>
                  <p style={{ fontWeight:700, fontSize:14, color:'#34d399' }}>{recipient.name}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)' }}>{recipient.email}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Amount (₹)</label>
              {balance != null && (
                <button type="button" onClick={() => setAmount(String(Math.floor(balance)))}
                  style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, padding: '3px 10px', cursor: 'pointer' }}
                >Max</button>
              )}
            </div>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:16, top:14, fontSize:22, fontWeight:700, color:'rgba(255,255,255,0.35)' }}>₹</span>
              <input
                type="number" required min={1} value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="glass-input"
                style={{ paddingLeft:42, fontSize:32, fontWeight:800, letterSpacing:'-1px', paddingTop:12, paddingBottom:12 }}
              />
            </div>
            {/* quick amounts */}
            <div style={{ display:'flex', gap:8, marginTop:10, flexWrap:'wrap' }}>
              {[500,1000,2000,5000].map(v => (
                <button key={v} type="button" onClick={() => setAmount(String(v))}
                  style={{ fontSize:13, fontWeight:600, padding:'6px 14px', borderRadius:8, cursor:'pointer', transition:'all 0.15s',
                    background: amount===String(v) ? 'rgba(124,58,237,0.3)' : 'var(--bg-surface)',
                    border:`1px solid ${amount===String(v) ? 'rgba(124,58,237,0.5)' : 'var(--border)'}`,
                    color: amount===String(v) ? '#a78bfa' : 'rgba(255,255,255,0.55)' }}
                >₹{v.toLocaleString('en-IN')}</button>
              ))}
            </div>
          </div>

          {/* note */}
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)',
              letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Note (optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              placeholder="Dinner split, rent, etc."
              className="glass-input" style={{ paddingTop:14, paddingBottom:14, fontSize:15 }} />
          </div>

          {/* errors */}
          {error && (
            <div style={{ display:'flex', alignItems:'flex-start', gap:10, background:'rgba(239,68,68,0.08)',
              border:'1px solid rgba(239,68,68,0.25)', borderRadius:14, padding:'12px 16px' }}>
              <AlertTriangle size={16} style={{ color:'#f87171', flexShrink:0, marginTop:2 }} />
              <span style={{ color:'#f87171', fontSize:14 }}>{error}</span>
              <button type="button" onClick={() => setError('')} style={{ marginLeft:'auto', background:'none', border:'none', color:'rgba(255,255,255,0.35)', cursor:'pointer' }}><X size={14} /></button>
            </div>
          )}

          <button type="submit" disabled={processing}
            className="btn-primary"
            style={{ height:56, fontSize:16, borderRadius:18, marginTop:4, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {processing ? <><div className="loader loader-sm" /> Processing…</> : <><Send size={18} /> Confirm Transfer</>}
          </button>
        </form>
      </div>
    </div>
  );
}