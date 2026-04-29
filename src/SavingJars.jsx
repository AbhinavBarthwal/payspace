import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Plus, Target, TrendingUp, Coins, ChevronRight, X, Sparkles } from 'lucide-react';
import { getBalance, addFunds } from './api';

const TIPS = [
  "Skip the daily latte: Saving ₹200/day adds up to ₹6,000/month!",
  "Use the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings.",
  "Sleep on it: Wait 24 hours before making a non-essential purchase.",
  "Audit your subscriptions: Cancel those apps you haven't used in months.",
  "Shop with a list: Impulse buys are the biggest budget killers.",
  "The 'Round Up' trick: Round every purchase to the next hundred and save the change."
];

export default function SavingJars() {
  const [jars, setJars] = useState(() => {
    const saved = localStorage.getItem('saving_jars');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'New iPhone', current: 15000, goal: 80000, color: '#a78bfa' },
      { id: 2, name: 'Europe Trip', current: 45000, goal: 250000, color: '#22d3ee' }
    ];
  });
  
  const [showCreate, setShowCreate] = useState(false);
  const [newJar, setNewJar] = useState({ name: '', goal: '', color: '#a78bfa' });
  const [tipIndex, setTipIndex] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    localStorage.setItem('saving_jars', JSON.stringify(jars));
  }, [jars]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 8000);
    loadBalance();
    return () => clearInterval(interval);
  }, []);

  const loadBalance = async () => {
    try {
      const data = await getBalance();
      setBalance(data.balance);
    } catch (e) { console.error(e); }
  };

  const createJar = () => {
    if (!newJar.name || !newJar.goal) return;
    const jar = {
      ...newJar,
      id: Date.now(),
      current: 0,
      goal: parseFloat(newJar.goal)
    };
    setJars([...jars, jar]);
    setShowCreate(false);
    setNewJar({ name: '', goal: '', color: '#a78bfa' });
  };

  const addMoney = async (id, amount) => {
    if (balance < amount) {
      alert("Insufficient balance in your main wallet!");
      return;
    }

    try {
      // Deduct from real backend wallet
      await addFunds(-amount);
      
      setJars(jars.map(j => {
        if (j.id === id) return { ...j, current: j.current + amount, animating: true };
        return j;
      }));

      setTimeout(() => {
        setJars(prev => prev.map(j => ({ ...j, animating: false })));
      }, 1000);

      // Reload balance from server to be sure
      loadBalance();
    } catch (e) {
      alert("Failed to update savings: " + e.message);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── Tips Banner ── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10 rounded-3xl p-6 flex items-center gap-4 relative overflow-hidden"
      >
        <div className="bg-white/10 p-3 rounded-2xl">
          <Sparkles className="text-yellow-400" size={24} />
        </div>
        <div className="flex-1">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Pro Saving Tip</p>
          <AnimatePresence mode="wait">
            <motion.p 
              key={tipIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-white/90 font-bold text-sm md:text-base"
            >
              "{TIPS[tipIndex]}"
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Pocket Jars</h2>
          <p className="text-white/50 font-medium">Stash away money for your big goals</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="bg-white text-black p-4 rounded-2xl flex items-center gap-2 font-black shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} /> <span className="hidden sm:inline">New Jar</span>
        </button>
      </div>

      {/* ── Jars Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jars.map(jar => (
          <JarCard key={jar.id} jar={jar} onAdd={() => addMoney(jar.id, 500)} />
        ))}
      </div>

      {/* ── Create Jar Modal ── */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-md p-8 relative z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black">Create Saving Jar</h3>
                <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white"><X size={24}/></button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Jar Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Travel, Laptop, Emergency" 
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all"
                    value={newJar.name}
                    onChange={e => setNewJar({...newJar, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Saving Goal (₹)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all"
                    value={newJar.goal}
                    onChange={e => setNewJar({...newJar, goal: e.target.value})}
                  />
                </div>
                <div className="flex gap-4">
                  {['#a78bfa', '#22d3ee', '#f472b6', '#fbbf24', '#4ade80'].map(c => (
                    <button 
                      key={c}
                      onClick={() => setNewJar({...newJar, color: c})}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${newJar.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50'}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <button 
                  onClick={createJar}
                  className="w-full bg-purple-600 py-5 rounded-2xl font-black text-lg shadow-xl shadow-purple-900/20 active:scale-95 transition-all mt-4"
                >
                  Start Saving
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function JarCard({ jar, onAdd }) {
  const percent = Math.min(100, (jar.current / jar.goal) * 100);
  
  return (
    <motion.div 
      layout
      className="glass-card p-6 relative overflow-hidden group border-white/5 hover:border-white/20 transition-all"
    >
      <AnimatePresence>
        {jar.animating && (
          <div className="absolute inset-0 z-10 pointer-events-none flex justify-center">
            {[1,2,3,4,5].map(i => (
              <motion.div
                key={i}
                initial={{ y: -50, opacity: 0, x: (i-3) * 20 }}
                animate={{ y: 300, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: "easeIn" }}
                className="absolute"
              >
                <Coins size={24} className="text-yellow-400 fill-yellow-400" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-start mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10" style={{ background: `${jar.color}20` }}>
          <Archive size={28} style={{ color: jar.color }} />
        </div>
        <div className="text-right">
          <p className="text-2xl font-black">₹{jar.current.toLocaleString()}</p>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">of ₹{jar.goal.toLocaleString()}</p>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">{jar.name}</h3>

      <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-6">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className="h-full rounded-full"
          style={{ background: jar.color }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-white/30" />
          <span className="text-xs font-bold text-white/50">{percent.toFixed(0)}% Achieved</span>
        </div>
        <button 
          onClick={onAdd}
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all active:scale-95"
        >
          Add ₹500
        </button>
      </div>
    </motion.div>
  );
}
