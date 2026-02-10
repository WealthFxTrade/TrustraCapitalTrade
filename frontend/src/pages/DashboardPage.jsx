import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader.jsx";
import { UserContext } from "../context/UserContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { joinInvestmentNode } from "../services/investmentService.js";
import { toast } from "react-hot-toast";

export default function DashboardPage() {
  const { stats, transactions, loading: statsLoading, refreshData } = useContext(UserContext);
  const { user, logout, initialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Modal State for node activation
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Listen for "Join Node" intent from Landing Page
  useEffect(() => {
    if (location.state?.autoOpenNode) {
      setSelectedNode(location.state.autoOpenNode);
      setIsInvestModalOpen(true);
      // Clean URL state so it doesn't pop up on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 2. Functional Button: Confirm Node Activation
  const handleActivateNode = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, you'd show an input for the 'amount'
      // For now, we use the min balance from your node data logic
      await joinInvestmentNode(selectedNode, 100); 
      toast.success(`${selectedNode} Node Activated!`);
      setIsInvestModalOpen(false);
      if (refreshData) refreshData(); // Update UserContext stats
    } catch (error) {
      toast.error(error.response?.data?.message || "Activation failed. Insufficient funds.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialized || statsLoading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-50 selection:bg-blue-500/30">
      <DashboardHeader
        user={user}
        balances={{
          USD: stats?.mainBalance || 0,
          BTC: stats?.btcBalance || 0,
          USDT: stats?.usdtBalance || 0,
        }}
        plan={stats?.activePlan || "No Active Node"}
        dailyRate={stats?.dailyRate || 0}
        logout={handleLogout}
        currency="€"
      />

      <main className="p-6 md:p-12 max-w-7xl mx-auto space-y-10">
        <header className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Recent Node Activity</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-1">Transaction Ledger v4.0</p>
          </div>
          {/* Functional Button to manually open investment modal */}
          <button 
            onClick={() => setIsInvestModalOpen(true)}
            className="text-[10px] font-black uppercase tracking-widest bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition-all"
          >
            + Deploy Capital
          </button>
        </header>

        {transactions?.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest italic">No recent network activity.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx._id} className="flex justify-between items-center p-5 bg-[#0a0d14] rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                <div className="space-y-1">
                  <p className="text-sm font-black font-mono text-white">€{tx.amount.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border ${tx.status === "completed" ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10" : "text-amber-500 border-amber-500/20 bg-amber-500/10"}`}>{tx.status}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* INVESTMENT MODAL */}
      {isInvestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0a0d14] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-white uppercase italic mb-2">Initialize Node</h3>
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-8">Protocol: {selectedNode || "Select Tier"}</p>
            
            <div className="space-y-4">
              <button 
                onClick={handleActivateNode}
                disabled={isSubmitting || !selectedNode}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30"
              >
                {isSubmitting ? "Syncing Ledger..." : "Confirm Activation"}
              </button>
              <button 
                onClick={() => setIsInvestModalOpen(false)}
                className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white"
              >
                Cancel Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

