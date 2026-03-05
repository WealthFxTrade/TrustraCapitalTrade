import React, { useState } from 'react';
import { 
  MessageSquare, Send, LifeBuoy, FileQuestion, 
  ChevronRight, Clock, ShieldCheck, CheckCircle2,
  Loader2, Mail, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Support() {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!message) return toast.error("Transmission body cannot be empty");

    setLoading(true);
    const loadToast = toast.loading("Encrypting Support Ticket...");

    try {
      // Logic for API call would go here
      // await api.post('/support/tickets', { subject, message });
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate lag
      toast.success("Protocol Assistance Requested. Ticket ID: #TR-" + Math.floor(1000 + Math.random() * 9000), { id: loadToast });
      setSubject('');
      setMessage('');
    } catch (err) {
      toast.error("Handshake Failed", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12 pt-28 font-sans selection:bg-yellow-500/30">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <header className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
            Protocol <span className="text-yellow-500">Assistance</span>
          </h1>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] italic">
            Direct secure line to Zurich Compliance & Technical Nodes.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* ── LEFT: TICKET FORM ── */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmitTicket} className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-8 md:p-12 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                <LifeBuoy size={200} />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Request Subject</label>
                <select 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-yellow-500/30 transition-all appearance-none"
                >
                  <option value="Technical">Technical Node Failure</option>
                  <option value="Liquidity">Liquidity Extraction Delay</option>
                  <option value="KYC">Identity Audit Verification</option>
                  <option value="Other">Other Protocol Request</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-2">Secure Message</label>
                <textarea 
                  rows="6"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the anomaly in detail..."
                  className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 text-sm font-medium text-white outline-none focus:border-yellow-500/30 transition-all resize-none"
                ></textarea>
              </div>

              <button 
                disabled={loading}
                className="w-full py-6 bg-yellow-500 text-black font-black uppercase italic tracking-[0.3em] text-[10px] rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-3 shadow-xl shadow-yellow-500/10"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Initialize Support Handshake <Send size={16} /></>}
              </button>
            </form>
          </div>

          {/* ── RIGHT: INFO & FAQS ── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem]">
              <h3 className="text-xs font-black uppercase tracking-widest text-yellow-500 mb-6 flex items-center gap-3">
                <Clock size={16} /> Response SLA
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">Tier-1 Accounts</span>
                  <span className="text-emerald-500">Instant / 1h</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">Standard Nodes</span>
                  <span>12 - 24 Hours</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 px-4">Common Protocols</p>
              {[
                "Resetting 2FA Keys",
                "Increasing Extraction Limits",
                "KYC Document Requirements"
              ].map((item, i) => (
                <div key={i} className="group bg-[#0a0c10] border border-white/5 p-6 rounded-2xl flex items-center justify-between cursor-pointer hover:border-white/20 transition-all">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white">{item}</span>
                  <ChevronRight size={14} className="text-gray-700" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
