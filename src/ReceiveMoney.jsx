import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Wallet, Copy, Check, Share2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStoredUser } from './api';

export default function ReceiveMoney() {
  const [user, setUser] = useState(getStoredUser());
  const [copied, setCopied] = useState(false);

  // The QR data will be the user's email
  // In a real app, this might be a specialized deep link or token
  const qrData = user?.email || 'user@example.com';

  const handleCopy = () => {
    navigator.clipboard.writeText(qrData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 md:py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12 w-full max-w-md text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-cyan-500" />
        
        <div className="mb-8">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Wallet className="text-purple-400" size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2">My QR Code</h2>
          <p className="text-white/50 text-sm font-medium uppercase tracking-widest">Scan to send money to me</p>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] inline-block shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-8 relative">
          <QRCodeSVG 
            value={qrData} 
            size={220}
            level="H"
            includeMargin={false}
            imageSettings={{
              src: `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'U'}&backgroundColor=transparent`,
              x: undefined,
              y: undefined,
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group">
            <div className="text-left overflow-hidden">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Your ID (Email)</p>
              <p className="font-bold text-white/90 truncate">{qrData}</p>
            </div>
            <button 
              onClick={handleCopy}
              className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white/70 hover:text-white"
            >
              {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
            </button>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 bg-white/5 border border-white/10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
              <Share2 size={18} /> Share
            </button>
            <button className="flex-1 bg-white/5 border border-white/10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
              <Download size={18} /> Save
            </button>
          </div>
        </div>
      </motion.div>
      
      <p className="mt-8 text-white/30 text-sm font-medium">
        Standard transaction limits may apply.
      </p>
    </div>
  );
}
