import React, { useState } from 'react';
import { 
  LifeBuoy, Send, MessageSquare, 
  Clock, ShieldCheck, AlertCircle, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/api';

export default function Support() {
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState({
    subject: '',
    category: 'Technical',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticket.message) return toast.error("Message protocol empty");

    setLoading(true);
    try {
      await api.post('/support/tickets', ticket);
      toast.success("Query Transmitted to Compliance Desk");
      setTicket({ subject: '', category: 'Technical', message: '' });
    } catch (err) {
      toast.error("Transmission Interrupted");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <LifeBuoy className="text-yellow-500" /> Support <span className="text-yellow-500">Desk</span>
        </h1>
        <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] mt-2">Direct Link to Zürich Compliance Officers</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Help Center Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#0a0f1e] border border-white/5 p-8 rounded-[2.5rem]">
            <h3 className="text-[10px] font-black uppercase text-yellow-500 tracking-widest mb-6">Operational Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Capital Node</span>
                <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Withdrawal Gateway</span>
                <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Operational
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
            <div className="flex gap-3 mb-4">
              <ShieldCheck className="text-yellow-500 shrink-0" size={18} />
              <p className="text-[10px] text-white font-black uppercase tracking-widest">Encrypted Channel</p>
            </div>
            <p className="text-[9px] text-gray-500 uppercase font-bold italic leading-relaxed">
              All communications are protected via end-to-end PGP encryption and logged for audit purposes.
            </p>
          </div>
        </div>

        {/* Ticket Submission Form */}
        <div className="lg:col-span-2">
          <div className="bg-[#0a0f1e] border border-white/5 p-8 md:p-10 rounded-[2.5rem]">
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare className="text-yellow-500" size={20} />
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Open <span className="text-yellow-500">Query</span></h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-2">Protocol Subject</label>
                  <input 
                    type="text"
                    required
                    value={ticket.subject}
                    onChange={(e) => setTicket({...ticket, subject: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-yellow-500/30 transition-all text-white"
                    placeholder="e.g. Deposit Confirmation"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-2">Node Category</label>
                  <select 
                    value={ticket.category}
                    onChange={(e) => setTicket({...ticket, category: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none focus:border-yellow-500/30 transition-all text-white appearance-none"
                  >
                    <option value="Technical">Technical Error</option>
                    <option value="Billing">Capital Settlement</option>
                    <option value="Compliance">Compliance/KYC</option>
                    <option value="Other">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-2">Detailed Narrative</label>
                <textarea 
                  required
                  rows="5"
                  value={ticket.message}
                  onChange={(e) => setTicket({...ticket, message: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-3xl px-6 py-5 text-xs font-medium leading-relaxed outline-none focus:border-yellow-500/30 transition-all text-white resize-none"
                  placeholder="Describe your query in detail..."
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-[0.4em] rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                Transmit Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
