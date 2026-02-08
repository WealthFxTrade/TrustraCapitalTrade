                {/* ... existing plan mapping ... */}
                <p className="text-xl font-black mb-1">{plan.roi}%</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Target ROI</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Main Form Area */}
            <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl">
              <form onSubmit={handleInvestment} className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end px-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Allocation Amount (EUR)
                    </label>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full border border-indigo-400/20">
                      Tier: {selectedPlan.name}
                    </span>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-700 group-focus-within:text-indigo-500 transition">€</div>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-black/40 border border-white/10 rounded-3xl py-8 pl-16 pr-8 text-4xl font-black outline-none focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                  
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest px-4 text-slate-600">
                    <span>Min: €{selectedPlan.min.toLocaleString()}</span>
                    <span>Max: {selectedPlan.max === Infinity ? 'Unlimited' : `€${selectedPlan.max.toLocaleString()}`}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-3xl">
                  <div className="flex gap-4 items-center">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400"><TrendingUp size={24}/></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1 text-left">Estimated Profit</p>
                      <p className="text-xl font-black text-white">€{calculateProfit()}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400"><ShieldCheck size={24}/></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1 text-left">Node Status</p>
                      <p className="text-xl font-black text-white">Verified</p>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3 group"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (
                    <>Deploy Capital <ChevronRight className="group-hover:translate-x-1 transition" size={18}/></>
                  )}
                </button>
              </form>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
               <div className="bg-[#0a0d14] border border-white/5 p-8 rounded-[2.5rem]">
                  <div className="flex items-center gap-3 mb-6">
                    <Wallet className="text-indigo-500" size={20} />
                    <h4 className="font-black uppercase italic text-sm">Deployment Details</h4>
                  </div>
                  <div className="space-y-4 text-xs">
                    <div className="flex justify-between py-3 border-b border-white/5">
                      <span className="text-slate-500">Processing Node</span>
                      <span className="font-bold">Trustra-X6</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/5">
                      <span className="text-slate-500">Settlement Currency</span>
                      <span className="font-bold">BTC / EUR</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-slate-500">Node Fee</span>
                      <span className="text-emerald-400 font-bold">0.00%</span>
                    </div>
                  </div>
               </div>
               
               <div className="p-6 bg-slate-900/40 rounded-[2rem] border border-white/5">
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">
                    "By deploying capital, you authorize the Trustra algorithmic engine to execute trades on your behalf. Returns are distributed daily at 00:00 UTC."
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

