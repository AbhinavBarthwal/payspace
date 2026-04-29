import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Camera, X, AlertTriangle, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScanPay({ onScanSuccess, onCancel }) {
  const [error, setError] = useState(null);
  const [isTorchOn, setIsTorchOn] = useState(false);

  const handleScan = (result) => {
    if (result) {
      // Assuming the QR code contains the recipient's email
      const data = result[0]?.rawValue || result;
      onScanSuccess(data);
    }
  };

  const handleError = (err) => {
    console.error(err);
    if (err.name === 'NotAllowedError') {
      setError('Camera permission denied. Please enable camera access in your settings.');
    } else {
      setError('Unable to access camera. Please make sure no other app is using it.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={onCancel}
          className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
        >
          <X size={24} />
        </button>
        <h2 className="text-white font-black text-xl tracking-tight">Scan QR Code</h2>
        <button 
          onClick={() => setIsTorchOn(!isTorchOn)}
          className={`p-3 backdrop-blur-md rounded-full transition-all ${isTorchOn ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white'}`}
        >
          <Zap size={24} />
        </button>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 relative flex items-center justify-center">
        {!error ? (
          <>
            <div className="w-full h-full">
              <Scanner
                onScan={handleScan}
                onError={handleError}
                allowMultiple={false}
                scanDelay={500}
                constraints={{ facingMode: 'environment' }}
                components={{
                  audio: false,
                  torch: isTorchOn,
                }}
                styles={{
                  container: { width: '100%', height: '100%' },
                  video: { objectFit: 'cover' }
                }}
              />
            </div>
            
            {/* Overlay Viewfinder */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Scanning Frame */}
                <div className="w-72 h-72 border-2 border-white/30 rounded-[3rem] relative overflow-hidden">
                  <div className="absolute inset-0 bg-transparent border-[60px] border-black/40" />
                  
                  {/* Animated scanning line */}
                  <motion.div 
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10"
                  />
                </div>
                
                {/* Corner Accents */}
                <div className="absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-cyan-400 rounded-tl-2xl" />
                <div className="absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 border-cyan-400 rounded-tr-2xl" />
                <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 border-cyan-400 rounded-bl-2xl" />
                <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-cyan-400 rounded-br-2xl" />
              </div>
            </div>

            <div className="absolute bottom-32 left-0 right-0 flex justify-center px-8 pointer-events-none">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                <Info size={18} className="text-cyan-400" />
                <p className="text-white/80 font-bold text-sm uppercase tracking-widest">Align QR code within the frame</p>
              </div>
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 text-center max-w-sm"
          >
            <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-2xl font-black text-white mb-4">Camera Error</h3>
            <p className="text-white/60 mb-8 font-medium leading-relaxed">{error}</p>
            <button 
              onClick={onCancel}
              className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all"
            >
              Go Back
            </button>
          </motion.div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="p-10 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2">
          <Camera size={16} className="text-white/40" />
          <span className="text-white/40 font-bold text-xs uppercase tracking-[0.2em]">PaySpace Secure Scanner</span>
        </div>
      </div>
    </div>
  );
}
