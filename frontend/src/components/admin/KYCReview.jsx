import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { 
  UserCheck, ShieldAlert, Image as ImageIcon, 
  Check, X, Loader2, Search, Eye, FileText 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function KYCReview() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchKYC = async () => {
    try {
      // Logic assumes you filter users by kycStatus: 'pending' on the backend
      const { data } = await api.get('/admin/users?kycStatus=pending');
      setSubmissions(data);
    } catch (err) {
      toast.error("Compliance Sync Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYC();
  }, []);

  const handleVerify = async (userId, status) => {
    try {
      await api.put(`/admin/users/${userId}`, { kycStatus: status });
      toast.success(`Entity ${status === 'verified' ? 'Authorized' : 'Rejected'}`);
      fetchKYC();
    } catch (err) {
      toast.error("Status Update Failed");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <UserCheck className="text-rose-500" /> Compliance <span className="text-rose-500">Center</span>
          </h1>
          <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] mt-2">ID Verification & AML Screening</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Submission List */}
        <div className="xl:col-span-2 space-y-4">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-rose-500" /></div>
          ) : submissions.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-20 text-center">
              <Check className="mx-auto text-emerald-500/20 mb-4" size={48} />
              <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest">No pending identity audits.</p>
            </div>
          ) : (
            submissions.map((sub) => (
              <div key={sub._id} className="bg-[#0a0f1e] border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-rose-500/20 transition-all">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-rose-500">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-white">{sub.fullName}</h3>
                    <p className="text-[10px] text-gray-500 font-mono">{sub.email}</p>
                    <p className="text-[9px] text-rose-500/50 uppercase font-black mt-1">Submitted: {new Date(sub.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => setSelectedDoc(sub.idDocumentUrl)} // Assumes your schema has this
                    className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 justify-center transition-all"
                  >
                    <Eye size={14} /> View ID
                  </button>
                  <button 
                    onClick={() => handleVerify(sub._id, 'rejected')}
                    className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <X size={18} />
                  </button>
                  <button 
                    onClick={() => handleVerify(sub._id, 'verified')}
                    className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                  >
                    <Check size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Live Preview Sidebar */}
        <div className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] p-8 h-fit sticky top-32">
          <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-6 flex items-center gap-2">
            <ImageIcon size={14} /> Document Preview
          </h3>
          {selectedDoc ? (
            <div className="space-y-6">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
                <img src={selectedDoc} alt="KYC Document" className="w-full h-auto" />
              </div>
              <button 
                onClick={() => window.open(selectedDoc, '_blank')}
                className="w-full py-3 bg-white/5 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
              >
                Open Original File
              </button>
            </div>
          ) : (
            <div className="aspect-[4/3] bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-gray-700">
              <ShieldAlert size={32} className="mb-2 opacity-20" />
              <p className="text-[9px] font-black uppercase tracking-widest">Select an entity to audit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
