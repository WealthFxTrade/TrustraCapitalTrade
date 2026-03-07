import React, { useState, useEffect } from 'react';
import { ScrollText, ArrowUpRight, ArrowDownLeft, Zap, ShieldAlert, Search } from 'lucide-react';
import api from '../../api/api';
import { format } from 'date-fns';

export default function GlobalLedger() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const { data } = await api.get('/admin/ledger');
        setLogs(data);
      } catch (err) {
        console.error("Ledger Sync Error");
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Global Ledger</h2>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Audit Trail • Zurich Mainnet</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
          <input 
            type="text" placeholder="Filter Ledger..."
            className="bg-white/5 border border-white/10 py-3 pl-12 pr-6 rounded-xl text-xs font-bold outline-none focus:border-yellow-500 w-64"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-gray-500">
              <tr>
                <th className="p-6">Timestamp</th>
                <th className="p-6">Entity</th>
                <th className="p-6">Type</th>
                <th className="p-6">Amount</th>
                <th className="p-6">Protocol Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {filteredLogs.map((log, i) => (
                <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-6 text-gray-500">
                    {format(new Date(log.createdAt), 'MMM dd · HH:mm:ss')}
                  </td>
                  <td className="p-6">
                    <span className="text-white font-bold italic uppercase">{log.username}</span>
                  </td>
                  <td className="p-6">
                    <LogTypeBadge type={log.type} />
                  </td>
                  <td className={`p-6 font-bold ${log.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {log.amount > 0 ? '+' : ''}{log.amount.toLocaleString()} {log.currency}
                  </td>
                  <td className="p-6 text-gray-400 italic">
                    {log.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LogTypeBadge({ type }) {
  const styles = {
    yield: "bg-emerald-500/10 text-emerald-500",
    withdrawal: "bg-red-500/10 text-red-500",
    deposit: "bg-blue-500/10 text-blue-500",
    transfer: "bg-purple-500/10 text-purple-500"
  };
  return (
    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter ${styles[type] || 'bg-white/10 text-white'}`}>
      {type}
    </span>
  );
}
