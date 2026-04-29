import { useState } from 'react';
import { Wallet, Mail, Lock, User, Eye, EyeOff, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { login, register } from './api';

export default function Login({ onLogin, onBack }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (mode === 'register' && !name.trim()) { setError('Name is required'); return; }
    setLoading(true);
    try {
      const data = mode === 'login' ? await login(email, pass) : await register(name.trim(), email, pass);
      onLogin(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#050505] relative overflow-hidden font-inter text-white selection:bg-orange-500 selection:text-white">
      
      {/* Animated Abstract Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-orange-500/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {onBack && (
        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          onClick={onBack} 
          className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 rounded-2xl text-white font-bold transition-all z-20 backdrop-blur-xl"
        >
          <ArrowLeft size={18} /> Back
        </motion.button>
      )}

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md relative z-10">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 md:p-14 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,107,53,0.5)]">
              <Wallet size={36} color="#fff" />
            </div>
            <h1 className="font-syne text-4xl font-black tracking-tight text-center mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-white/50 text-center font-medium">
              {mode === 'login' ? 'Securely access your wallet' : 'Start your financial journey today'}
            </p>
          </div>

          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 mb-10 relative">
            {['login', 'register'].map(m => (
              <button key={m} type="button" onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wide capitalize transition-all relative z-10 ${mode === m ? 'text-black' : 'text-white/50 hover:text-white'}`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
            <motion.div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-md z-0"
              initial={false}
              animate={{ left: mode === 'login' ? '6px' : 'calc(50% + 0px)' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <AnimatePresence mode="popLayout">
              {mode === 'register' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative">
                  <User size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 rounded-2xl py-5 pl-14 pr-6 text-white outline-none transition-all font-medium placeholder:text-white/30" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="email" placeholder="Email Address" value={email} required onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 rounded-2xl py-5 pl-14 pr-6 text-white outline-none transition-all font-medium placeholder:text-white/30" />
            </div>

            <div className="relative">
              <Lock size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" />
              <input type={showPw ? 'text' : 'password'} placeholder="Password" value={pass} required onChange={e => setPass(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 rounded-2xl py-5 pl-14 pr-14 text-white outline-none transition-all font-medium placeholder:text-white/30" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-4">
                  <AlertTriangle size={18} className="shrink-0" />
                  <span className="font-bold text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-300 hover:to-orange-500 text-white font-black text-xl py-5 rounded-2xl shadow-[0_10px_30px_rgba(255,107,53,0.3)] transition-all flex items-center justify-center mt-2"
            >
              {loading ? <div className="loader w-6 h-6 border-[3px] border-white/30 border-t-white" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}