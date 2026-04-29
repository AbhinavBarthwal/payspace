import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Plus, Target, Coins, X, Sparkles, Trash2 } from 'lucide-react';

const TIPS = [
  "Skip the daily latte: Saving ₹200/day adds up to ₹6,000/month!",
  "Use the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings.",
  "Sleep on it: Wait 24 hours before making a non-essential purchase.",
  "Audit your subscriptions: Cancel those apps you haven't used in months.",
  "Shop with a list: Impulse buys are the biggest budget killers.",
  "The 'Round Up' trick: Round every purchase to the next hundred and save the change."
];

const COLORS = ['#a78bfa', '#22d3ee', '#f472b6', '#fbbf24', '#4ade80', '#f87171'];

export default function SavingJars() {
  const [jars, setJars] = useState(() => {
    try { return JSON.parse(localStorage.getItem('saving_jars')) || defaultJars(); }
    catch { return defaultJars(); }
  });

  const [showCreate, setShowCreate] = useState(false);
  const [newJar, setNewJar] = useState({ name: '', goal: '', color: '#a78bfa' });
  const [tipIndex, setTipIndex] = useState(0);
  const [addingTo, setAddingTo] = useState(null); // jar id being added to
  const [customAmount, setCustomAmount] = useState('500');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // jar id to confirm delete

  useEffect(() => {
    localStorage.setItem('saving_jars', JSON.stringify(jars));
  }, [jars]);

  useEffect(() => {
    const interval = setInterval(() => setTipIndex(p => (p + 1) % TIPS.length), 8000);
    return () => clearInterval(interval);
  }, []);

  const createJar = () => {
    if (!newJar.name.trim() || !newJar.goal || parseFloat(newJar.goal) <= 0) return;
    setJars(prev => [...prev, {
      id: Date.now(), name: newJar.name.trim(),
      goal: parseFloat(newJar.goal), current: 0, color: newJar.color
    }]);
    setShowCreate(false);
    setNewJar({ name: '', goal: '', color: '#a78bfa' });
  };

  const addMoney = (id, amount) => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    setJars(prev => prev.map(j => {
      if (j.id !== id) return j;
      const next = Math.min(j.current + amt, j.goal);
      return { ...j, current: next, animating: true };
    }));
    setTimeout(() => setJars(prev => prev.map(j => ({ ...j, animating: false }))), 1200);
    setAddingTo(null);
    setCustomAmount('500');
  };

  const deleteJar = (id) => {
    setJars(prev => prev.filter(j => j.id !== id));
    setDeleteConfirm(null);
  };

  const totalSaved = jars.reduce((s, j) => s + j.current, 0);
  const totalGoal  = jars.reduce((s, j) => s + j.goal, 0);

  return (
    <div className="space-y-8 pb-12">

      {/* ── Tips Banner ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10 rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden"
      >
        <div className="bg-white/10 p-3 rounded-2xl shrink-0">
          <Sparkles className="text-yellow-400" size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Pro Saving Tip</p>
          <AnimatePresence mode="wait">
            <motion.p key={tipIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="text-white/90 font-bold text-sm"
            >
              "{TIPS[tipIndex]}"
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Header + Summary ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Pocket Jars</h2>
          <p className="text-white/50 font-medium text-sm mt-1">
            {jars.length > 0
              ? `₹${totalSaved.toLocaleString('en-IN')} saved of ₹${totalGoal.toLocaleString('en-IN')} total goal`
              : 'Create a jar to start saving'}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="bg-white text-black px-5 py-3 rounded-2xl flex items-center gap-2 font-black shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} /> <span>New Jar</span>
        </button>
      </div>

      {/* ── Empty State ── */}
      {jars.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-card p-16 flex flex-col items-center justify-center gap-4 text-center"
        >
          <Archive size={48} className="text-white/20" />
          <p className="text-white/50 font-bold text-lg">No saving jars yet</p>
          <p className="text-white/30 text-sm">Create a jar to start stashing money for your goals</p>
          <button onClick={() => setShowCreate(true)} className="mt-2 bg-purple-600 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-purple-500 transition-colors">
            Create First Jar
          </button>
        </motion.div>
      )}

      {/* ── Jars Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {jars.map(jar => (
            <JarCard
              key={jar.id} jar={jar}
              onAdd={(amt) => addMoney(jar.id, amt)}
              onAddOpen={() => { setAddingTo(jar.id); setCustomAmount('500'); }}
              isAddingOpen={addingTo === jar.id}
              customAmount={customAmount}
              setCustomAmount={setCustomAmount}
              onAddClose={() => setAddingTo(null)}
              onDelete={() => setDeleteConfirm(jar.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* ── Create Jar Modal ── */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-md p-8 relative z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black">Create Saving Jar</h3>
                <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white"><X size={24}/></button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Jar Name</label>
                  <input type="text" placeholder="e.g. Travel, Laptop, Emergency"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all"
                    value={newJar.name} onChange={e => setNewJar({...newJar, name: e.target.value})}
                    onKeyDown={e => e.key === 'Enter' && createJar()}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Saving Goal (₹)</label>
                  <input type="number" placeholder="0"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all text-2xl font-bold"
                    value={newJar.goal} onChange={e => setNewJar({...newJar, goal: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Colour</label>
                  <div className="flex gap-3">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setNewJar({...newJar, color: c})}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${newJar.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50'}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <button onClick={createJar} disabled={!newJar.name.trim() || !newJar.goal}
                  className="w-full bg-purple-600 disabled:opacity-40 py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all mt-2"
                >
                  Start Saving
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card w-full max-w-sm p-8 relative z-10 text-center"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={28} className="text-red-400" />
              </div>
              <h3 className="text-xl font-black mb-3">Delete this jar?</h3>
              <p className="text-white/50 text-sm mb-8">This can't be undone. Any amount tracked locally will be lost.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-white/5 border border-white/10 py-3 rounded-2xl font-bold text-sm hover:bg-white/10 transition-colors"
                >Cancel</button>
                <button onClick={() => deleteJar(deleteConfirm)}
                  className="flex-1 bg-red-500/20 border border-red-500/30 text-red-400 py-3 rounded-2xl font-bold text-sm hover:bg-red-500/30 transition-colors"
                >Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function defaultJars() {
  return [
    { id: 1, name: 'New iPhone', current: 15000, goal: 80000, color: '#a78bfa' },
    { id: 2, name: 'Europe Trip', current: 45000, goal: 250000, color: '#22d3ee' },
  ];
}

function JarCard({ jar, onAdd, onAddOpen, isAddingOpen, customAmount, setCustomAmount, onAddClose, onDelete }) {
  const percent = Math.min(100, (jar.current / jar.goal) * 100);
  const remaining = Math.max(0, jar.goal - jar.current);
  const isComplete = jar.current >= jar.goal;

  return (
    <motion.div layout exit={{ opacity: 0, scale: 0.9 }}
      className="glass-card p-6 relative overflow-hidden group border-white/5 hover:border-white/20 transition-all"
    >
      {/* Coin rain animation */}
      <AnimatePresence>
        {jar.animating && (
          <div className="absolute inset-0 z-10 pointer-events-none flex justify-center">
            {[1,2,3,4,5].map(i => (
              <motion.div key={i}
                initial={{ y: -50, opacity: 0, x: (i-3) * 20 }}
                animate={{ y: 300, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: "easeIn" }}
                className="absolute"
              >
                <Coins size={22} className="text-yellow-400 fill-yellow-400" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Completed banner */}
      {isComplete && (
        <div className="absolute top-4 right-4 bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
          🎉 Goal Reached!
        </div>
      )}

      <div className="flex justify-between items-start mb-5">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10" style={{ background: `${jar.color}20` }}>
          <Archive size={24} style={{ color: jar.color }} />
        </div>
        <button onClick={onDelete} className="text-white/20 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100">
          <Trash2 size={16} />
        </button>
      </div>

      <h3 className="text-lg font-bold mb-1">{jar.name}</h3>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-black">₹{jar.current.toLocaleString('en-IN')}</span>
        <span className="text-white/40 text-xs font-bold">of ₹{jar.goal.toLocaleString('en-IN')}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden mb-2">
        <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }}
          className="h-full rounded-full transition-all"
          style={{ background: jar.color, boxShadow: `0 0 10px ${jar.color}88` }}
        />
      </div>
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-1.5">
          <Target size={12} className="text-white/30" />
          <span className="text-xs font-bold text-white/40">{percent.toFixed(0)}% done</span>
        </div>
        {!isComplete && <span className="text-xs font-bold text-white/30">₹{remaining.toLocaleString('en-IN')} to go</span>}
      </div>

      {/* Add money section */}
      {!isComplete && (
        isAddingOpen ? (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 font-bold text-sm">₹</span>
              <input
                type="number" value={customAmount} onChange={e => setCustomAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-7 pr-3 text-white text-sm font-bold outline-none focus:border-purple-500/50"
                autoFocus min={1}
                onKeyDown={e => { if (e.key === 'Enter') onAdd(customAmount); if (e.key === 'Escape') onAddClose(); }}
              />
            </div>
            <button onClick={() => onAdd(customAmount)}
              className="bg-white text-black px-4 rounded-xl font-black text-sm hover:bg-white/90 active:scale-95 transition-all"
            >Add</button>
            <button onClick={onAddClose}
              className="bg-white/5 border border-white/10 px-3 rounded-xl text-white/40 hover:text-white transition-colors"
            ><X size={14}/></button>
          </div>
        ) : (
          <button onClick={onAddOpen}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ color: jar.color }}
          >
            <Plus size={16}/> Add Money
          </button>
        )
      )}
    </motion.div>
  );
}
