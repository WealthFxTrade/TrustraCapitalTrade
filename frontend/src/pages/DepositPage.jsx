import React, { useState, useEffect, useCallback, useContext } from "react";
import QRCode from "qrcode.react";
import toast from "react-hot-toast";
import { RefreshCw, Copy, Check, Loader2, AlertCircle } from "lucide-react";

import { UserContext } from "../context/UserContext.jsx";
import { getDepositAddress, getDepositHistory, createFiatDeposit } from "../api";

export default function DepositPage() {
  const { addTransaction } = useContext(UserContext);

  const [method, setMethod] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [deposit, setDeposit] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load Crypto Address
  const loadDeposit = useCallback(
    async (fresh = false) => {
      if (method === "BANK") return;
      try {
        setLoading(true);
        const res = await getDepositAddress(method, fresh);
        setDeposit(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load deposit address");
      } finally {
        setLoading(false);
      }
    },
    [method]
  );

  // Load Crypto Deposit History
  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await getDepositHistory(method);
      setHistory(res.data || []);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }, [method]);

  useEffect(() => {
    if (method !== "BANK") loadDeposit();
    loadHistory();
    const interval = setInterval(loadHistory, 60000); // Refresh history every 60s
    return () => clearInterval(interval);
  }, [method, loadDeposit, loadHistory]);

  const copyAddress = () => {
    if (!deposit?.address) return;
    navigator.clipboard.writeText(deposit.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Address copied!");
  };

  const submitFiat = async (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value < 100) return toast.error("Minimum deposit is €100");

    try {
      setLoading(true);
      const res = await createFiatDeposit({ amount: value, method });

      toast.success("Deposit request submitted!");
      addTransaction({
        _id: res.data.id,
        amount: value,
        status: "completed",
        createdAt: new Date().toISOString(),
      });

      setAmount("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto space-y-8 text-white">
      <h1 className="text-2xl font-bold">Add Money</h1>
      <p className="text-gray-400 text-sm mb-6">
        Fund your account via Crypto or Bank Transfer
      </p>

      {/* Method Selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {["BTC", "USDT", "BANK"].map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`py-3 rounded-xl border font-bold text-xs transition-all ${
              method === m
                ? "border-indigo-500 bg-indigo-500/10 text-white"
                : "border-gray-800 bg-[#0f121d] text-gray-400"
            }`}
          >
            {m === "BANK" ? "Bank Transfer" : m}
          </button>
        ))}
      </div>

      {/* Payment Area */}
      <div className="bg-[#161b29] border border-gray-800 rounded-2xl p-6 shadow-xl">
        {method === "BANK" ? (
          <form onSubmit={submitFiat} className="space-y-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (€)"
              className="w-full p-4 rounded-xl bg-[#0f121d] border border-gray-800 text-white font-bold"
            />
            <button
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold uppercase text-xs"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : "Confirm Deposit"}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center space-y-6 text-center">
            {loading ? (
              <RefreshCw className="animate-spin text-indigo-500" size={32} />
            ) : deposit ? (
              <>
                <div className="bg-white p-3 rounded-2xl">
                  <QRCode value={deposit.address} size={180} />
                </div>

                <div className="w-full space-y-2 text-left">
                  <label className="text-gray-400 text-[10px] uppercase tracking-widest px-1">
                    Your {method} Address
                  </label>
                  <div className="flex items-center gap-2 bg-[#0f121d] border border-gray-800 p-4 rounded-xl">
                    <span className="truncate flex-1 font-mono text-xs text-indigo-400">
                      {deposit.address}
                    </span>
                    <button onClick={copyAddress} className="text-gray-400 hover:text-white">
                      {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex w-full gap-4">
                  <button
                    onClick={() => loadDeposit(true)}
                    className="flex-1 bg-gray-800 py-3 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} /> New Address
                  </button>
                  <div className="flex-1 bg-indigo-500/10 border border-indigo-500/20 py-3 rounded-lg text-[10px] font-bold uppercase text-indigo-400 flex items-center justify-center">
                    Status: {deposit.status}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Payment Notice */}
      <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-3 text-[11px]">
        <AlertCircle className="text-indigo-500" size={20} />
        <span>
          Send only <strong>{method}</strong> to this address. Other coins may result in permanent loss.
        </span>
      </div>

      {/* Recent Deposit History */}
      <div className="bg-[#161b29] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 font-black text-[10px] uppercase tracking-widest text-gray-500">
          History
        </div>
        <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
          {historyLoading ? (
            <div className="text-center py-4">
              <Loader2 className="animate-spin mx-auto text-gray-600" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-[11px] text-gray-600 text-center italic">No recent deposits.</p>
          ) : (
            history.map((d) => (
              <div
                key={d._id}
                className="flex justify-between items-center bg-[#0f121d] p-3 rounded-xl border border-gray-800/50"
              >
                <div>
                  <p className="text-[11px] font-bold italic">€{d.amount}</p>
                  <p className="text-[9px] text-gray-600 uppercase tracking-tighter">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                    d.status === "completed"
                      ? "text-green-500 bg-green-500/10"
                      : "text-yellow-500 bg-yellow-500/10"
                  }`}
                >
                  {d.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
