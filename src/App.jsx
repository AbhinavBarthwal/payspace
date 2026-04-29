import { useState, useMemo } from 'react';
import {
  Wallet, LayoutDashboard, Send, PieChart, LogOut,
  PlusCircle, History, Menu, X, Bell, User, Camera, Archive
} from 'lucide-react';
import Landing from './Landing';
import Login from './Login';
import Dashboard from './Dashboard';
import Transfer from './Transfer';
import Analytics from './Analytics';
import AddFunds from './AddFunds';
import TransactionHistory from './TransactionHistory';
import TransactionDetail from './TransactionDetail';
import ReceiveMoney from './ReceiveMoney';
import ScanPay from './ScanPay';
import SavingJars from './SavingJars';
import { logout, isLoggedIn, getStoredUser, getTransactions } from './api';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Nav Link Definitions ── */
const NAV_LINKS = [
  { view: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
  { view: 'transfer', icon: <Send size={20} />, label: 'Transfer' },
  { view: 'history', icon: <History size={20} />, label: 'History' },
  { view: 'analytics', icon: <PieChart size={20} />, label: 'Analytics' },
  { view: 'jars', icon: <Archive size={20} />, label: 'Savings' },
];

/* ── TopBar Component ── */
function TopBar({ currentView, user, onMenuToggle, isMobileMenuOpen, onLogout }) {
  const title = useMemo(() => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'transfer': return 'Send Money';
      case 'analytics': return 'Analytics';
      case 'history': return 'Transaction History';
      case 'txDetail': return 'Receipt';
      case 'scan': return 'Scan to Pay';
      case 'jars': return 'Pocket Jars';
      default: return 'Overview';
    }
  }, [currentView]);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      height: 72, background: 'rgba(5,11,31,0.6)', backdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 clamp(16px, 4vw, 32px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onMenuToggle}
          className="md:hidden"
          style={{ background: 'var(--bg-surface-md)', border: '1px solid var(--border)', borderRadius: 12, padding: 8, color: '#fff', cursor: 'pointer' }}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <h1 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Quick Scan Button */}
        <button
          onClick={() => onMenuToggle('scan')}
          style={{ background: 'var(--purple)', border: 'none', borderRadius: 12, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          className="hover:scale-105 active:scale-95 transition-all"
        >
          <Camera size={18} />
          <span className="hidden sm:inline">Scan</span>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', display: 'none' }} className="lg:flex">
          <span style={{ fontWeight: 700, fontSize: 14 }}>{user?.name}</span>
          <span style={{ fontSize: 12, opacity: 0.5 }}>{user?.email}</span>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--bg-surface)', overflow: 'hidden' }}>
          <img
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'U'}&backgroundColor=transparent`}
            alt="User"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [showLanding, setShowLanding] = useState(!isLoggedIn());
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn());
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [user, setUser] = useState(getStoredUser());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scanEmail, setScanEmail] = useState('');
  const [lastTxId, setLastTxId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTx = async () => {
      try {
        const txs = await getTransactions();
        if (txs.length > 0) {
          const latest = txs[0];
          if (lastTxId && latest.id !== lastTxId && latest.type === 'CREDIT') {
            setNotification(latest);
            setTimeout(() => setNotification(null), 5000);
          }
          setLastTxId(latest.id);
        }
      } catch (e) { 
        console.error('Polling error:', e); 
        if (e.status === 403 || e.status === 401) {
          console.warn('Session invalid, logging out...');
          handleLogout();
        }
      }
    };

    const interval = setInterval(checkTx, 30000);
    checkTx();
    return () => clearInterval(interval);
  }, [isAuthenticated, lastTxId]);

  const handleGetStarted = () => { setShowLanding(false); setShowLogin(true); };

  const handleLogin = (data) => {
    setUser({ name: data.name, email: data.email });
    setIsAuthenticated(true);
    setShowLogin(false);
    setShowLanding(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
    setShowLanding(true);
    setShowLogin(false);
    setCurrentView('dashboard');
    setIsMobileMenuOpen(false);
  };

  const navigateTo = (view) => { setCurrentView(view); setIsMobileMenuOpen(false); };
  const handleViewTx = (tx) => { setSelectedTransaction(tx); setCurrentView('txDetail'); };

  if (showLanding && !isAuthenticated) return <Landing onGetStarted={handleGetStarted} />;
  if (!isAuthenticated) return <Login onLogin={handleLogin} onBack={() => setShowLanding(true)} />;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onViewChange={navigateTo} onViewTx={handleViewTx} />;
      case 'transfer': return <Transfer onViewChange={navigateTo} initialEmail={scanEmail} />;
      case 'analytics': return <Analytics />;
      case 'addFunds': return <AddFunds onViewChange={navigateTo} />;
      case 'history': return <TransactionHistory onViewChange={navigateTo} onViewTx={handleViewTx} />;
      case 'txDetail': return <TransactionDetail tx={selectedTransaction} onViewChange={navigateTo} />;
      case 'receive': return <ReceiveMoney />;
      case 'scan': return <ScanPay onScanSuccess={(email) => { setScanEmail(email); navigateTo('transfer'); }} onCancel={() => navigateTo('dashboard')} />;
      case 'jars': return <SavingJars />;
      default: return <Dashboard onViewChange={navigateTo} onViewTx={handleViewTx} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--bg-base)' }}>
      <div className="mesh-bg"><div className="orb3" /></div>

      {/* ════════ MOBILE SIDEBAR ════════ */}
      <aside style={{
        position: 'fixed', inset: '0 auto 0 0', zIndex: 100,
        width: isMobileMenuOpen ? 'min(300px, 85vw)' : 0,
        background: 'rgba(5,11,31,0.95)',
        backdropFilter: 'blur(32px)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: isMobileMenuOpen ? '24px 16px' : '24px 0',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
        boxShadow: isMobileMenuOpen ? '12px 0 48px rgba(0,0,0,0.8)' : 'none',
      }} className="md:hidden">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, padding: '0 12px' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 8 }}>
            <Wallet size={20} color="#1e0b4b" />
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-1px' }}>PaySpace</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {NAV_LINKS.map(l => (
            <button key={l.view} onClick={() => navigateTo(l.view)}
              className={`nav-item ${currentView === l.view ? 'active' : ''}`}
              style={{ background: 'none', border: '1px solid transparent', cursor: 'pointer', justifyContent: 'flex-start', padding: '14px 16px' }}>
              <span className="nav-icon-wrap" style={{ background: currentView === l.view ? 'rgba(124,58,237,0.2)' : 'transparent' }}>{l.icon}</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{l.label}</span>
            </button>
          ))}
        </div>

        <button onClick={handleLogout} className="nav-item" style={{ color: '#f87171', borderColor: 'transparent', background: 'none', marginTop: 'auto', cursor: 'pointer', padding: '14px 16px' }}>
          <span className="nav-icon-wrap"><LogOut size={20} /></span>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Logout</span>
        </button>
      </aside>

      {/* ── Mobile Overlay ── */}
      {isMobileMenuOpen && <div onClick={() => setIsMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 90, backdropFilter: 'blur(4px)' }} />}

      {/* ════════ DESKTOP SIDEBAR ════════ */}
      <aside className="hidden md:flex" style={{
        position: 'sticky', top: 0, height: '100dvh',
        width: 80, flexShrink: 0, flexDirection: 'column', alignItems: 'center',
        padding: '24px 0',
        background: 'rgba(5,11,31,0.4)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border)',
        zIndex: 30,
      }}>
        <div style={{ marginBottom: 40, width: 48, height: 48, background: '#fff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wallet size={24} color="#1e0b4b" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', flex: 1, alignItems: 'center' }}>
          {NAV_LINKS.map(l => (
            <button key={l.view} onClick={() => navigateTo(l.view)} title={l.label}
              className={`nav-item ${currentView === l.view ? 'active' : ''}`}
              style={{ width: 52, height: 52, padding: 0, justifyContent: 'center', background: 'none', cursor: 'pointer', borderRadius: 16 }}>
              <span className="nav-icon-wrap" style={{ width: '100%', height: '100%' }}>{l.icon}</span>
            </button>
          ))}
        </div>

        <button onClick={handleLogout} title="Logout"
          style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16, border: 'none', background: 'transparent', color: '#f87171', cursor: 'pointer' }}>
          <LogOut size={24} />
        </button>
      </aside>

      {/* ════════ MAIN CONTENT ════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar
          currentView={currentView}
          user={user}
          onMenuToggle={(v) => typeof v === 'string' ? navigateTo(v) : setIsMobileMenuOpen(true)}
          isMobileMenuOpen={isMobileMenuOpen}
          onLogout={handleLogout}
        />
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          <div style={{ padding: 'clamp(16px, 4vw, 40px)', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
            {renderView()}
          </div>
        </main>
      </div>

      {/* ── Notification Popup ── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => { handleViewTx(notification); setNotification(null); }}
            className="fixed bottom-8 right-8 z-[200] glass-card p-6 border-purple-500/30 shadow-2xl shadow-purple-500/20 cursor-pointer max-w-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                <PlusCircle size={24} />
              </div>
              <div>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Money Received!</p>
                <p className="text-xl font-black">₹{notification.amount.toLocaleString()}</p>
                <p className="text-xs text-white/60">From {notification.counterpartyEmail}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}