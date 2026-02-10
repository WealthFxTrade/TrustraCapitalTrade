import React, { useContext } from "react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import { UserContext } from "../context/UserContext.jsx";
import { useAuth } from "../context/AuthContext.jsx"; // 🔥 Added Auth for real user data
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const { stats, transactions, loading: statsLoading } = useContext(UserContext);
  const { user, logout, initialized } = useAuth(); // 🔥 Get real user and logout function
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Wait for both Auth and User data to be ready
  if (!initialized || statsLoading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-50 selection:bg-blue-500/30">
      {/* Dashboard Header - Now using REAL data */}
      <DashboardHeader
        user={user} 
        balances={{
          USD: stats?.mainBalance || 0,
          BTC: stats?.btcBalance || 0,
          USDT: stats?.usdtBalance || 0,
        }}
        plan={stats?.activePlan || "Starter Node"}
        dailyRate={stats?.dailyRate || 0}
        logout={handleLogout}
        currency="€"
      />

      {/* Main Content */}
      <main className="p-6 md:p-12 max-w-7xl mx-auto space-y-10">
        <header>
          <h2 className="text-xl font-black italic uppercase tracking-tighter">Recent Node Activity</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-1">Transaction Ledger v4.0</p>
        </header>

        {transactions?.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest italic">No recent network activity.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {transactions.slice(0, 10).map((tx) => (
              <div
                key={tx._id}
                className="flex justify-between items-center p-5 bg-[#0a0d14] rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="space-y-1">
                  <p className="text-sm font-black font-mono text-white">
                    €{tx.amount.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                    {new Date(tx.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-lg border ${
                      tx.status === "completed"
                        ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10"
                        : "text-amber-500 border-amber-500/20 bg-amber-500/10"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

