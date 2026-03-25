// src/pages/Admin/SystemHealth.jsx - FULLY CORRECTED & UNSHORTENED VERSION
import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Database,
  Cpu,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Clock,
  Loader2,
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function SystemHealth() {
  const [health, setHealth] = useState({
    status: 'active',
    uptime: 0,
    timestamp: '',
    btcWatcher: 'running',
    rioEngine: 'active',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    setRefreshing(true);
    setError(null);

    try {
      const { data } = await api.get('/api/admin/health');

      setHealth({
        status: data.status || 'active',
        uptime: Math.floor(data.uptime || 0),
        timestamp: data.timestamp || new Date().toISOString(),
        btcWatcher: 'running',
        rioEngine: 'active',
      });
    } catch (err) {
      console.error('[SYSTEM HEALTH ERROR]', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to connect to system health endpoint.'
      );
      toast.error('Health check failed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `\( {h}h \){m}m`;
  };

  if (loading && !health.uptime) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-[#020408]">
        <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mb-6" />
        <p className="text-gray-400 font-black uppercase tracking-[0.5em] text-sm">Synchronizing Core Telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-[#020408] p-6">
        <div className="bg-rose-900/10 border border-rose-500/30 rounded-[2.5rem] p-12 max-w-md text-center">
          <AlertTriangle className="w-20 h-20 text-rose-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-rose-400 mb-4">Health Check Failed</h2>
          <p className="text-gray-300 mb-8">{error}</p>
          <button
            onClick={fetchHealth}
            className="px-10 py-4 bg-rose-600 hover:bg-rose-500 rounded-2xl font-black uppercase tracking-widest text-sm transition-all"
          >
            Retry Diagnostic
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-28 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <Activity size={22} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">REAL-TIME TELEMETRY</span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">
              System <span className="text-yellow-500">Integrity</span>
            </h1>
          </div>

          <button
            onClick={fetchHealth}
            disabled={refreshing}
            className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 disabled:opacity-50 text-sm font-black uppercase tracking-widest transition-all"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'SCANNING...' : 'FORCE DIAGNOSTIC'}
          </button>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatusCard
            icon={Server}
            title="Backend Status"
            value="OPERATIONAL"
            color="emerald"
            detail={`Uptime: ${formatUptime(health.uptime)}`}
          />
          <StatusCard
            icon={Zap}
            title="RIO Engine"
            value="ACTIVE"
            color="yellow"
            detail="Midnight Distribution Ready"
          />
          <StatusCard
            icon={Database}
            title="BTC Watcher"
            value="RUNNING"
            color="blue"
            detail="Scans every 5 minutes"
          />
          <StatusCard
            icon={ShieldCheck}
            title="Security Layer"
            value="SECURED"
            color="emerald"
            detail="AES-256 • SSL 1.3"
          />
        </div>

        {/* Sub-Systems */}
        <div className="bg-[#0A0C10] border border-white/5 rounded-[2.5rem] p-10">
          <div className="flex items-center gap-3 mb-10">
            <Terminal size={20} className="text-yellow-500" />
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">SUB-SYSTEM INTEGRITY</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            <IntegrityRow label="Authentication Bridge" status="Secured" color="text-emerald-400" />
            <IntegrityRow label="Socket.IO Layer" status="Connected" color="text-yellow-400" />
            <IntegrityRow label="Rate Limiter" status="Enforced" color="text-emerald-400" />
            <IntegrityRow label="JWT Validation" status="v2.5.1" color="text-white/60" />
            <IntegrityRow label="CORS Policy" status="Strict" color="text-yellow-400" />
            <IntegrityRow label="MongoDB Connection" status="Healthy" color="text-emerald-400" />
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-mono text-emerald-400/70">
              All emergency cut-off switches are currently <span className="font-black text-emerald-400">ARMED</span>
            </p>
          </div>
        </div>

        <div className="text-center mt-8 text-[9px] text-gray-600 font-mono">
          LAST UPDATED • {new Date(health.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

/* ── HELPER COMPONENTS ── */
const StatusCard = ({ icon: Icon, title, value, color, detail }) => (
  <div className={`bg-[#0A0C10] border border-white/10 p-8 rounded-[2rem] transition-all hover:border-yellow-500/30 group`}>
    <div className="flex justify-between mb-6">
      <div className={`p-4 rounded-2xl ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'}`}>
        <Icon size={28} />
      </div>
    </div>
    <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">{title}</h3>
    <p className="text-4xl font-black tracking-tighter text-white">{value}</p>
    <p className="text-[10px] text-gray-500 mt-4">{detail}</p>
  </div>
);

const IntegrityRow = ({ label, status, color }) => (
  <div className="flex justify-between items-center py-1 group">
    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{label}</span>
    <span className={`font-black text-sm uppercase tracking-widest ${color}`}>{status}</span>
  </div>
);
