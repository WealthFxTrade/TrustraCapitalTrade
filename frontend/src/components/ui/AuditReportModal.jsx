import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Printer, Download, 
  FileText, Globe, Cpu, CheckCircle2, Lock 
} from 'lucide-react';

export default function AuditReportModal({ isOpen, onClose, txData }) {
  const [isDecrypting, setIsDecrypting] = useState(true);

  // Simulate "Handshake/Decryption" delay when opened
  useEffect(() => {
    if (isOpen) {
      setIsDecrypting(true);
      const timer = setTimeout(() => setIsDecrypting(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      {/* Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-2xl bg-[#0a0c10] border border-white/10 rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center px-10 py-8 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-2xl">
              <ShieldCheck className="text-yellow-500" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black italic tracking-tighter uppercase">Verification <span className="text-yellow-500">Report</span></h2>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Audit Hash: {txData?.id || 'TRSTR-X882'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={24} className="text-slate-500 hover:text-white" />
          </button>
        </div>

        {/* Report Content */}
        <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {isDecrypting ? (
            <div className="py-20 text-center space-y-4">
              <Cpu className="mx-auto text-yellow-500 animate-spin" size={32} />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500/40">Decrypting Ledger Data...</p>
            </div>
          ) : (
            <>
              {/* Document Header */}
              <div className="flex justify-between items-start border-b border-white/5 pb-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black rounded-lg uppercase">
                    <CheckCircle2 size={12} /> Status: Settled
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Execution Date</p>
                    <p className="text-sm font-black italic uppercase tracking-tighter text-white">
                      {txData?.date || 'FEB 28, 2026 • 23:05:12'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Settlement Hub</p>
                  <p className="text-sm font-black italic uppercase tracking-tighter text-white">London_Node_v4</p>
                  <div className="flex items-center justify-end gap-2 mt-2 opacity-30 italic font-black text-[10px]">
                    <Globe size={12} /> 51.5074° N, 0.1278° W
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-8 py-4">
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Protocol Action</p>
                    <p className="text-lg font-black italic uppercase tracking-tighter text-white">{txData?.type || 'Node Allocation'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Network Cipher</p>
                    <code className="text-[10px] font-mono text-slate-400 break-all leading-relaxed">
                      0x8f2a9c...d4e5f6g7h8i9j0k1l2m3n4o5
                    </code>
                  </div>
                </div>
                <div className="space-y-6 text-right">
                  <div>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Transferred Quantum</p>
                    <p className="text-2xl font-black italic text-yellow-500">{txData?.amount || '€5,000.00'}</p>
                  </div>
                  <div className="flex justify-end pt-4">
                    <div className="p-4 border border-white/5 rounded-2xl bg-white/[0.02]">
                       <Lock className="text-slate-700" size={32} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Seal */}
              <div className="p-8 bg-yellow-500/5 border border-yellow-500/10 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="text-yellow-500" size={20} />
                  <h4 className="text-[11px] font-black text-yellow-500 uppercase tracking-[0.2em]">Institutional Guarantee</h4>
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed tracking-widest">
                  This transaction was executed under <span className="text-white">Audit Protocol v8.4.1</span>. Managed Node execution ensured zero-latency settlement across cross-border ledgers. Identity verified via biometric handshake.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-10 py-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
          <button 
            className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-yellow-500 transition-all active:scale-95"
            onClick={() => window.print()}
          >
            <Printer size={16} /> Print Record
          </button>
          <button className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-95">
            <Download size={16} /> Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}

