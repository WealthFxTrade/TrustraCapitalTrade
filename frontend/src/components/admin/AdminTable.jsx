// src/components/admin/AdminTable.jsx - REUSABLE ADMIN TABLE
import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Download, Loader2, AlertTriangle } from 'lucide-react';
import { CSVLink } from 'react-csv';
import toast from 'react-hot-toast';
import api from '../../api/api';

export default function AdminTable({ fetchUrl, tableName, columns, rowRenderer }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ── Fetch data
  const fetchData = async () => {
    setRefreshing(true);
    try {
      const { data: response } = await api.get(fetchUrl);
      setData(response.data || response[tableName.toLowerCase()] || []);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to load ${tableName}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchUrl]);

  // ── Filtered data
  const filteredData = useMemo(
    () =>
      data.filter((item) =>
        columns.some((col) =>
          item[col.key]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      ),
    [data, searchTerm, columns]
  );

  // ── CSV Export
  const csvData = filteredData.map((item) =>
    columns.reduce((acc, col) => ({ ...acc, [col.label]: item[col.key] }), {})
  );

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#020408] min-h-screen text-white font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            {tableName.toUpperCase()} <span className="text-yellow-500">MANAGEMENT</span>
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.3em] font-black">
            Review and manage {tableName.toLowerCase()}
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder={`Search ${tableName.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 pl-11 py-3 rounded-2xl text-sm focus:border-yellow-500 outline-none"
            />
          </div>

          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-white/10 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            REFRESH
          </button>

          <CSVLink
            data={csvData}
            filename={`${tableName.toLowerCase()}_export.csv`}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-green-500 hover:text-black rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-white/10"
          >
            <Download size={16} /> EXPORT
          </CSVLink>
        </div>
      </div>

      {/* Data List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem] p-20 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-6" />
            <p className="text-gray-400 font-black uppercase tracking-[0.4em]">
              No {tableName.toLowerCase()} found
            </p>
          </div>
        ) : (
          filteredData.map((item) => rowRenderer(item))
        )}
      </div>
    </div>
  );
}
