// src/components/admin/WithdrawalManager.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { CSVLink } from 'react-csv';
import { Loader2, CheckCircle2, XCircle, Clock, Download, RefreshCw, ExternalLink } from 'lucide-react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

const WITHDRAWALS_PER_PAGE = 25;

export default function WithdrawalManager() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWithdrawals, setSelectedWithdrawals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // ── Fetch Withdrawals with Pagination ───────────────────────
  const fetchWithdrawals = async (page = 1) => {
    setRefreshing(true);
    try {
      const { data } = await api.get('/admin/withdrawals', {
        params: { page, limit: WITHDRAWALS_PER_PAGE, sortField, sortOrder },
      });
      setWithdrawals(data.withdrawals || []);
      setCurrentPage(page);
      setTotalPages(Math.ceil((data.total || data.withdrawals.length) / WITHDRAWALS_PER_PAGE));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load withdrawal queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [sortField, sortOrder]);

  // ── Process Withdrawal ──────────────────────────────────────
  const processWithdrawal = async (id, status) => {
    setProcessingId(id);
    const confirmMsg =
      status === 'completed'
        ? 'Approve this withdrawal? Funds will be sent to the user.'
        : 'Reject this withdrawal? Funds will be refunded to user balance.';

    if (!window.confirm(confirmMsg)) {
      setProcessingId(null);
      return;
    }

    const toastId = toast.loading(status === 'completed' ? 'Approving payout...' : 'Rejecting withdrawal...');

    try {
      await api.patch(`/admin/withdrawal/${id}`, { status });
      toast.success(`Withdrawal ${status} successfully`, { id: toastId });
      fetchWithdrawals(currentPage);
      setSelectedWithdrawals((prev) => prev.filter((w) => w !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process withdrawal', { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  // ── Bulk Actions ───────────────────────────────────────────
  const handleSelectWithdrawal = (id) => {
    setSelectedWithdrawals((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));
  };

  const handleBulkProcess = async (status) => {
    if (!selectedWithdrawals.length) return toast.error('No withdrawals selected');
    if (!window.confirm(`Are you sure you want to mark selected withdrawals as ${status}?`)) return;

    const toastId = toast.loading(
      status === 'completed' ? 'Approving payouts...' : 'Rejecting withdrawals...'
    );

    try {
      await Promise.all(
        selectedWithdrawals.map((id) => api.patch(`/admin/withdrawal/${id}`, { status }))
      );
      toast.success(`Selected withdrawals marked as ${status}`, { id: toastId });
      setSelectedWithdrawals([]);
      fetchWithdrawals(currentPage);
    } catch (err) {
      toast.error('Failed to process selected withdrawals', { id: toastId });
    }
  };

  // ── Filter Withdrawals ──────────────────────────────────────
  const filteredWithdrawals = useMemo(
    () =>
      withdrawals.filter(
        (w) =>
          w.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.address?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [withdrawals, searchTerm]
  );

  // ── CSV Export ─────────────────────────────────────────────
  const csvData = filteredWithdrawals.map((w) => ({
    Username: w.username,
    Email: w.email,
    Address: w.address,
    Amount: w.amount,
    Status: w.status,
    Date: new Date(w.createdAt).toLocaleString(),
  }));

  // ── Helpers ───────────────────────────────────────────────
  const getStatusColor = (status) => {
    if (status === 'pending') return 'text-yellow-400 border-yellow-500/30';
    if (status === 'completed') return 'text-emerald-400 border-emerald-500/30';
    return 'text-red-400 border-red-500/30';
  };

  const StatusIcon = ({ status }) => {
    if (status === 'pending') return <Clock size={24} className="text-yellow-500 animate-pulse" />;
    if (status === 'completed') return <CheckCircle2 size={24} className="text-emerald-500" />;
    return <XCircle size={24} className="text-red-500" />;
  };

  // ── Render ────────────────────────────────────────────────
  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-yellow-500" /></div>;

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#020408] min-h-screen text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          WITHDRAWAL <span className="text-yellow-500">MANAGEMENT</span>
        </h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search user, address, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 bg-white/5 border border-white/10 pl-4 py-3 rounded-2xl text-sm focus:border-yellow-500 outline-none"
          />
          <button
            onClick={() => fetchWithdrawals(currentPage)}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-white/10 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> REFRESH
          </button>
          <CSVLink
            data={csvData}
            filename="withdrawals_export.csv"
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-green-500 hover:text-black rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-white/10"
          >
            <Download size={16} /> EXPORT
          </CSVLink>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedWithdrawals.length > 0 && (
        <div className="flex gap-4">
          <button
            onClick={() => handleBulkProcess('completed')}
            className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-black text-xs font-black uppercase tracking-widest disabled:opacity-50"
          >
            APPROVE SELECTED
          </button>
          <button
            onClick={() => handleBulkProcess('rejected')}
            className="px-4 py-3 bg-red-500 hover:bg-red-600 rounded-2xl text-black text-xs font-black uppercase tracking-widest disabled:opacity-50"
          >
            REJECT SELECTED
          </button>
        </div>
      )}

      {/* Withdrawals Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-black/40 text-gray-400 text-xs uppercase tracking-wider">
              <th className="p-4"><input type="checkbox" onChange={(e) => setSelectedWithdrawals(e.target.checked ? withdrawals.map(w => w._id) : [])} checked={selectedWithdrawals.length === withdrawals.length && withdrawals.length > 0} /></th>
              <th className="p-4">User</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Destination</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredWithdrawals.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-10 text-center text-gray-500 italic">
                  No pending withdrawals
                </td>
              </tr>
            ) : (
              filteredWithdrawals.map((w) => (
                <tr key={w._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <input type="checkbox" checked={selectedWithdrawals.includes(w._id)} onChange={() => handleSelectWithdrawal(w._id)} />
                  </td>
                  <td className="p-4">
                    <div className="text-white font-medium">{w.username}</div>
                    <div className="text-gray-500 text-sm">{w.email}</div>
                  </td>
                  <td className="p-4 font-mono text-yellow-500">€{Number(w.amount).toLocaleString()}</td>
                  <td className="p-4 text-gray-400 text-sm">
                    <span className="cursor-pointer hover:text-yellow-300 select-all" onClick={() => navigator.clipboard.writeText(w.address)}>
                      {w.address}
                    </span>
                    <ExternalLink size={14} className="inline ml-1 opacity-50" />
                  </td>
                  <td className={`p-4 flex items-center gap-2 font-black text-xs uppercase tracking-widest ${getStatusColor(w.status)}`}>
                    <StatusIcon status={w.status} /> {w.status}
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{new Date(w.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-right flex gap-2 justify-end">
                    {w.status === 'pending' && (
                      <>
                        <button
                          onClick={() => processWithdrawal(w._id, 'completed')}
                          disabled={processingId === w._id}
                          className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button
                          onClick={() => processWithdrawal(w._id, 'rejected')}
                          disabled={processingId === w._id}
                          className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center p-6 bg-white/[0.01] rounded-lg">
        <button
          disabled={currentPage === 1}
          onClick={() => fetchWithdrawals(currentPage - 1)}
          className="px-4 py-2 bg-white/5 rounded-2xl hover:bg-yellow-500 hover:text-black transition-all text-xs font-black uppercase tracking-widest"
        >
          Previous
        </button>
        <span className="text-xs font-black uppercase text-gray-400">
          Page {currentPage} / {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => fetchWithdrawals(currentPage + 1)}
          className="px-4 py-2 bg-white/5 rounded-2xl hover:bg-yellow-500 hover:text-black transition-all text-xs font-black uppercase tracking-widest"
        >
          Next
        </button>
      </div>
    </div>
  );
}
