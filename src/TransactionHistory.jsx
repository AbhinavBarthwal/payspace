import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Filter, ChevronRight } from 'lucide-react';
import { getTransactions } from './api';

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);
}

function timeAgo(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TransactionHistory({ onViewChange, onViewTx }) {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'credit' | 'debit'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getTransactions()
      .then(txs => setAllTransactions(txs))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const mapped = allTransactions.map(tx => ({
    id: tx.id,
    title: tx.description || (tx.type === 'CREDIT' ? 'Received' : 'Sent'),
    category: tx.category,
    date: timeAgo(tx.timestamp),
    rawDate: new Date(tx.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    amount: `${tx.type === 'CREDIT' ? '+' : '-'}${formatINR(tx.amount)}`,
    type: tx.type === 'CREDIT' ? 'credit' : 'debit',
    status: 'Completed',
    counterparty: tx.counterpartyEmail,
    balanceAfter: tx.balanceAfter,
    rawAmount: tx.amount,
    rawTx: tx,
  }));

  const filtered = mapped.filter(tx => {
    const matchType = filter === 'all' || tx.type === filter;
    const matchSearch = !search || tx.title.toLowerCase().includes(search.toLowerCase()) || 
      tx.category.toLowerCase().includes(search.toLowerCase()) ||
      (tx.counterparty || '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in pt-4 md:pt-8">
      
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all text-lg"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none cursor-pointer font-bold appearance-none hover:bg-white/10 transition-colors"
          >
            <option value="all" className="bg-[#050b1f]">All Types</option>
            <option value="credit" className="bg-[#050b1f]">Received</option>
            <option value="debit" className="bg-[#050b1f]">Sent</option>
          </select>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-center text-white/40">
            <Filter size={20} />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl px-6 py-4">{error}</div>
      )}

      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-4 md:p-8 rounded-[40px]">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-white/5 rounded-[28px] animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <p className="text-xl">No transactions found</p>
            {mapped.length === 0 && <p className="mt-2">Make your first transfer or add funds to get started!</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(tx => (
              <div
                key={tx.id}
                onClick={() => onViewTx(tx)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-[28px] transition-all cursor-pointer group gap-4 sm:gap-0"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-green-400/10 text-green-400' : 'bg-white/10 text-white/80'}`}>
                     {tx.type === 'credit' ? <ArrowDownRight className="w-7 h-7" /> : <ArrowUpRight className="w-7 h-7" />}
                  </div>
                  <div>
                    <p className="font-bold text-xl tracking-tight mb-0.5 truncate max-w-[150px] sm:max-w-none">{tx.title}</p>
                    <p className="text-sm text-white/50 font-medium">
                      {tx.date} 
                      <span className="hide-mobile">
                        <span className="mx-2 text-white/20">•</span> 
                        <span className="bg-white/5 px-2 py-1 rounded-md text-white/70">{tx.category}</span>
                      </span>
                      {tx.counterparty && <span className="ml-2 text-white/40 hide-tablet">· {tx.counterparty}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto pl-[76px] sm:pl-0 gap-6">
                  <div className={`font-bold text-2xl tracking-tighter ${tx.type === 'credit' ? 'text-green-400' : 'text-white'}`}>
                    {tx.amount}
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-white/80 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}