// src/pages/Admin/GlobalLedger.jsx - GLOBAL LEDGER WITH SORTING & PAGINATION
import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Search,
  Download,
  Loader2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function GlobalLedger() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'

  const fetchGlobalLedger = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.get('/api/admin/ledger');
      setTransactions(data.transactions || data.data || data || []);
      setCurrentPage(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load global ledger');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalLedger();
  }, []);

  // Filter, search and sort
  const processedTransactions = useMemo(() => {
    let result = [...transactions];

    // Type filter
    if (filter !== 'all') {
      result = result.filter(tx => tx.type === filter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(tx =>
        tx.username?.toLowerCase().includes(term) ||
        tx.description?.toLowerCase().includes(term) ||
        tx.walletAddress?.toLowerCase().includes(term)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle dates
      if (sortField === 'createdAt') {
        valA = new Date(valA);
        valB = new Date(valB);
      }

      // Handle numbers
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      // Handle strings
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      return 0;
    });

    return result;
  }, [transactions, filter, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedTransactions.slice(start, start + itemsPerPage);
  }, [processedTransactions, currentPage]);

  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Type', 'Amount', 'Currency', 'Status', 'Description'];
    const rows = processedTransactions.map(tx => [
      new Date(tx.createdAt).toLocaleString(),
      tx.username || 'Unknown',
      tx.type,
      tx.amount,
      tx.currency,
      tx.status,
      tx.description || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `global-ledger-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Ledger exported successfully');
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#020408] min-h-screen text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            GLOBAL <span className="text-yellow-500">LEDGER</span>
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.3em] font-black">
            Complete transaction history • {processedTransactions.length} records
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 md:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search user, description or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 pl-11 py-3 rounded-2xl text-sm focus:border-yellow-500 outline-none"
            />
          </div>

          <button
            onClick={fetchGlobalLedger}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-white/10 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            REFRESH
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white hover:text-black rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-white/10"
          >
            <Download size={16} />
            EXPORT CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {['all', 'deposit', 'withdrawal', 'yield', 'compound', 'investment'].map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setCurrentPage(1);
            }}
            className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              filter === f 
                ? 'bg-yellow-500 text-black' 
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="bg-[#0A0C10] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-[9px] font-black uppercase tracking-widest text-gray-500">
                <th 
                  className="px-8 py-6 cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                  onClick={() => handleSort('createdAt')}
                >
                  DATE {sortField === 'createdAt' && (sortDirection === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}
                </th>
                <th className="px-8 py-6">USER</th>
                <th 
                  className="px-8 py-6 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('type')}
                >
                  TYPE
                </th>
                <th 
                  className="px-8 py-6 text-right cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  AMOUNT {sortField === 'amount' && (sortDirection === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}
                </th>
                <th className="px-8 py-6">DESCRIPTION</th>
                <th className="px-8 py-6 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-yellow-500" size={40} />
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-32 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6 text-xs text-gray-400 font-mono">
                      {new Date(tx.createdAt).toLocaleDateString()}<br />
                      <span className="text-[10px]">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-medium">{tx.username || 'Unknown User'}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="capitalize text-sm font-medium">{tx.type}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.amount > 0 ? '+' : ''}€{Math.abs(tx.amount || 0).toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-300">
                      {tx.description || 'No description'}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-block px-5 py-1 text-xs font-black rounded-full border tracking-widest ${
                        tx.status === 'completed' ? 'border-emerald-500 text-emerald-400' :
                        tx.status === 'pending' ? 'border-yellow-500 text-yellow-400' : 'border-red-500 text-red-400'
                      }`}>
                        {tx.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <div className="flex items-center gap-2 px-8 py-3 bg-white/5 rounded-2xl font-mono">
            Page <span className="font-bold text-yellow-400">{currentPage}</span> of {totalPages}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <div className="text-center text-[9px] text-gray-600 font-mono">
        Showing {paginatedTransactions.length} of {processedTransactions.length} transactions • Real-time synchronized
      </div>
    </div>
  );
}
