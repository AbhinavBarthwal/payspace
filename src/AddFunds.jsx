import { useState, useEffect } from 'react';
import { CreditCard, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { addFunds, getMe } from './api';

function formatINR(amount) {
  if (amount == null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);
}

export default function AddFunds({ onViewChange }) {
  const [amount, setAmount] = useState('1000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    getMe().then(u => setBalance(u.balance)).catch(() => {});
  }, []);

  const handleAddFunds = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError('Please enter a valid amount'); return; }
    setError('');
    setIsProcessing(true);
    try {
      await addFunds(num);
      setSuccess(true);
      setTimeout(() => onViewChange('dashboard'), 2500);
    } catch (err) {
      setError(err.message || 'Failed to add funds');
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }}
          className="bg-white/5 backdrop-blur-3xl border border-white/20 p-16 rounded-[3rem] shadow-[0_0_100px_rgba(16,185,129,0.2)] text-center max-w-lg w-full"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="w-32 h-32 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-10 border border-green-500/40">
            <CheckCircle2 className="w-16 h-16" />
          </motion.div>
          <h2 className="font-syne text-5xl font-black mb-6 tracking-tight text-white">Funds Added!</h2>
          <p className="text-white/60 text-xl mb-4 font-medium"><span className="text-white font-bold">{formatINR(amount)}</span> has been credited instantly.</p>
          <p className="text-white/30 text-sm uppercase tracking-widest font-bold">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex justify-center pt-4 md:pt-16 pb-12">
      <motion.div 
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 md:p-14 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] max-w-2xl w-full relative overflow-hidden"
      >
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12 relative z-10">
          <div className="bg-white text-black p-3 md:p-5 rounded-2xl md:rounded-[2rem] shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            <Landmark className="w-6 h-6 md:w-10 md:h-10" />
          </div>
          <div>
            <h2 className="font-syne text-2xl md:text-5xl font-black tracking-tight text-white leading-tight">Top Up</h2>
            {balance != null && <p className="text-white/50 mt-1 text-sm md:text-lg font-medium">Balance: <span className="text-white font-bold">{formatINR(balance)}</span></p>}
          </div>
        </div>

        <div className="mb-12 relative z-10">
          <label className="block text-xs font-bold text-white/50 mb-4 tracking-widest uppercase">Select Amount</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {['500', '1000', '2000', '5000', '10000'].map(val => (
              <motion.button 
                key={val} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setAmount(val)}
                className={`py-5 rounded-2xl font-black text-xl transition-all border ${amount === val ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}
              >
                ₹{parseInt(val).toLocaleString('en-IN')}
              </motion.button>
            ))}
          </div>
          <div className="relative mt-4">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 font-black text-3xl">₹</span>
            <input 
              type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-white outline-none focus:border-white focus:ring-4 focus:ring-white/10 text-4xl font-black transition-all placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="space-y-4 mb-12 relative z-10">
          <label className="block text-xs font-bold text-white/50 mb-4 tracking-widest uppercase">Payment Method</label>
          
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center justify-between p-6 md:p-8 bg-green-500/10 border border-green-500/30 rounded-[2rem] cursor-pointer shadow-inner">
            <div className="flex items-center gap-6">
              <div className="bg-green-500/20 p-4 rounded-2xl">
                <Landmark className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <span className="font-syne font-black text-2xl block text-white mb-1">Simulated Bank</span>
                <span className="text-green-400/80 text-sm font-bold uppercase tracking-widest">Demo Mode — Instant Credit</span>
              </div>
            </div>
            <CheckCircle2 className="w-10 h-10 text-green-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </motion.div>
          
          <div className="flex items-center gap-6 p-6 md:p-8 bg-white/5 border border-white/10 rounded-[2rem] opacity-40 cursor-not-allowed">
            <div className="bg-white/10 p-4 rounded-2xl">
              <CreditCard className="w-8 h-8 text-white/70" />
            </div>
            <span className="font-syne font-bold text-xl text-white">Add New Card or UPI</span>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-5 mb-8">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <span className="font-bold">{error}</span>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleAddFunds} disabled={isProcessing}
          className="w-full bg-white text-black font-black text-2xl py-6 rounded-2xl hover:bg-white/90 transition-all flex justify-center items-center shadow-[0_10px_30px_rgba(255,255,255,0.2)] relative z-10"
        >
          {isProcessing ? <div className="loader border-black border-t-transparent w-8 h-8 mx-auto" /> : `Add ${formatINR(amount || 0)}`}
        </motion.button>
      </motion.div>
    </div>
  );
}