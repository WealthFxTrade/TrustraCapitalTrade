import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  User, 
  Clock,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminKYC() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchSubmissions = async () => {
    try {
      const res = await api.get('/admin/kyc/pending');
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      toast.error("Compliance Node Sync Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleVerification = async (userId, status) => {
    try {
      await api.post(`/admin/kyc/verify`, { userId, status });
      toast.success(`Identity Protocol: ${status.toUpperCase()}`);
      fetchSubmissions();
      setSelectedDoc(null);
    } catch (err) {
      toast.error("Failed to update Identity status");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6 lg:p-10 bg-[#05070a] min-h-screen text-white">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 text-yellow-500">
            <ShieldCheck size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Compliance Terminal</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Identity <span className="text-slate-800">/</span> Audit</h1>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* SUBMISSION LIST */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Verification Queue</h3>
          {loading ? (
            <div className="p-10 text-center animate-pulse text-slate-600 font-bold">Initializing Scanners...</div>
          ) : submissions.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <p className="text-xs text-slate-600 uppercase font-black tracking-widest">Registry Clear</p>
            </div>
          ) : (
            submissions.map((sub) => (
              <div 
                key={sub._id}
                onClick={() => setSelectedDoc(sub)}
                className={`glass-card p-4 cursor-pointer transition-all border-l-4 ${
                  selectedDoc?._id === sub._id ? 'border-l-blue-500 bg-blue-500/5' : 'border-l-transparent hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 rounded-lg text-slate-500">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{sub.fullName}</p>
                      <p className="text-[9px] text-slate-500 font-mono">{new Date(sub.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Eye size={14} className="text-slate-700" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* REVIEW PANEL */}
        <div className="lg:col-span-2">
          {selectedDoc ? (
            <div className="glass-card flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="text-sm font-black uppercase italic text-white">{selectedDoc.fullName}</h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">ID Type: {selectedDoc.idType || 'Document'}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleVerification(selectedDoc._id, 'verified')}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase transition-all"
                  >
                    <CheckCircle2 size={14} /> Authorize
                  </button>
                  <button 
                    onClick={() => handleVerification(selectedDoc._id, 'rejected')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all"
                  >
                    <XCircle size={14} /> Flag
                  </button>
                </div>
              </div>

              {/* DOCUMENT VIEW */}
              <div className="p-8 flex-1 bg-black/40 flex flex-col items-center">
                <div className="relative group w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
                  
                  <a 
                    href={selectedDoc.kycDocumentUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="absolute bottom-4 right-4 p-3 bg-black/60 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
                
                <div className="mt-8 w-full max-w-lg p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 text-blue-500 mb-4">
                    <FileText size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">User Metadata</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-[10px] font-bold">
                    <div className="text-slate-500 uppercase">Registered Email:</div>
                    <div className="text-white font-mono">{selectedDoc.email}</div>
                    <div className="text-slate-500 uppercase">Last Sync:</div>
                    <div className="text-white font-mono">{new Date(selectedDoc.updatedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card h-full flex flex-col items-center justify-center text-center p-20 opacity-30">
              <ShieldCheck size={80} className="text-slate-800 mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Select Identity Node for Audit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

