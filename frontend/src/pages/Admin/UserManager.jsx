// ... (imports remain the same)

export default function UserManager() {
  // ... (state and fetchUsers remains the same)

  const handleAdjustBalance = async (userId) => {
    // Pro-tip: Prompting for 'amount' is fine, but clarify if it's Main or Profit
    const amount = window.prompt("Enter amount to ADD (positive) or SUBTRACT (negative):");
    if (amount === null || amount === "" || isNaN(amount)) return;

    try {
      // Logic: Ensure this hits the PUT/PATCH route we defined in the userController
      await api.put(`/admin/users/${userId}/balance`, { 
        asset: 'EUR', 
        amount: Number(amount),
        type: 'adjustment' 
      });
      toast.success("Balance synchronized successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Adjustment failed");
    }
  };

  // ... (filtering logic remains the same)

  return (
    <div className="p-8 bg-[#05070a] min-h-screen text-white font-sans">
      {/* ... (Header and Search remain the same) */}
      
      <div className="bg-[#0f121d] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            {/* ... (thead remains the same) */}
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => {
                // FIX: Convert Map to Object if necessary to avoid .get() crashes
                const balances = u.balances instanceof Map 
                  ? Object.fromEntries(u.balances) 
                  : (u.balances || {});

                return (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500 font-bold uppercase text-xs border border-indigo-500/20">
                          {u.email[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{u.fullName || u.name || 'Anonymous'}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-white">
                          Main: <span className="text-indigo-400">€{(balances.EUR || 0).toLocaleString()}</span>
                        </p>
                        <p className="text-xs font-black text-gray-500">
                          Profit: <span className="text-emerald-500">€{(balances.EUR_PROFIT || 0).toLocaleString()}</span>
                        </p>
                      </div>
                    </td>
                    <td className="p-6">
                      <code className="text-[10px] font-mono text-gray-600 group-hover:text-indigo-400 transition-colors">
                        {u.btcAddress || 'No Node Derived'}
                      </code>
                    </td>
                    <td className="p-6 text-right space-x-2">
                      <button
                        onClick={() => handleAdjustBalance(u._id)}
                        className="p-3 bg-white/5 hover:bg-indigo-600 hover:text-white rounded-xl transition text-gray-500"
                        title="Adjust Balance"
                      >
                        <Wallet size={16} />
                      </button>
                      <button className="p-3 bg-white/5 hover:bg-rose-600 hover:text-white rounded-xl transition text-gray-500">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
