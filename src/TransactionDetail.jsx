import { ArrowLeft, CheckCircle2, Copy, Download, Share, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TransactionDetail({ tx, onViewChange }) {
  if (!tx) { onViewChange('dashboard'); return null; }
  const isCredit = tx.type === 'credit';

  return (
    <div className="max-w-2xl mx-auto space-y-8 flex flex-col justify-center pt-4 md:pt-12 pb-12">
      <motion.button 
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        onClick={() => onViewChange('history')} 
        className="flex items-center gap-3 text-white/50 hover:text-white transition-colors w-fit text-lg font-bold bg-white/5 px-5 py-3 rounded-2xl border border-white/10"
      >
        <ArrowLeft className="w-5 h-5" /> Back to History
      </motion.button>

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 md:p-14 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group">
        
        <div className={`absolute top-[-30%] left-[-20%] w-[80%] h-[80%] blur-[120px] rounded-full pointer-events-none transition-opacity duration-1000 ${isCredit ? 'bg-green-500/20' : 'bg-orange-500/20'}`} />

        <div className="text-center border-b border-white/10 pb-12 mb-10 relative z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border ${isCredit ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/10 text-white/80 border-white/20'}`}>
            <CheckCircle2 className="w-12 h-12" />
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`font-syne text-6xl md:text-7xl font-black tracking-tighter mb-4 ${isCredit ? 'text-green-400' : 'text-white'}`}>
            {tx.amount}
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-white/50 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-green-400" /> Completed Successfully
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-6 relative z-10">
          <DetailRow label="Transaction ID" value={tx.id} copyable />
          <DetailRow label="Date & Time" value={tx.date} />
          <DetailRow label="Category" value={<span className="bg-white/10 px-3 py-1 rounded-lg text-white/90">{tx.category}</span>} />
          
          <div className="h-px w-full bg-white/10 my-8" />
          
          <DetailRow label={isCredit ? "From" : "Paid To"} value={isCredit ? tx.sender : tx.receiver} highlight />
          <DetailRow label={isCredit ? "Received By" : "Paid From"} value={isCredit ? tx.receiver : tx.sender} />
          
          <div className="h-px w-full bg-white/10 my-8" />
          
          <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10">
            <span className="text-white/50 font-bold text-sm uppercase tracking-widest">Total Amount</span>
            <span className="font-syne font-black text-3xl tracking-tighter text-white">{tx.amount.replace('+', '').replace('-', '')}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row gap-4 mt-12 relative z-10">
          <button className="flex-1 bg-white/10 border border-white/20 py-5 px-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/20 active:scale-95 transition-all font-bold text-lg text-white">
            <Download className="w-5 h-5" /> Download PDF
          </button>
          <button className="flex-1 bg-white border border-transparent text-black py-5 px-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/90 active:scale-95 transition-all font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <Share className="w-5 h-5" /> Share Receipt
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function DetailRow({ label, value, highlight, copyable }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0 p-2">
      <span className="text-white/40 font-bold text-xs uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-3">
        <span className={`font-medium text-lg text-right ${highlight ? 'text-white font-bold' : 'text-white/80'}`}>{value}</span>
        {copyable && <Copy className="w-4 h-4 text-white/30 cursor-pointer hover:text-white transition-colors" title="Copy" />}
      </div>
    </div>
  );
}