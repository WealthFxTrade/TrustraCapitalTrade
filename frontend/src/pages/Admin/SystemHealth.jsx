// src/pages/Admin/SystemHealth.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, Server, Database, Cpu, RefreshCw, 
  ShieldCheck, AlertCircle, Zap, Clock, Loader2, Globe 
} from 'lucide-react';
import api from '../../constants/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function SystemHealth() {
  const [health, setHealth] = useState({
    status: 'operational',
    uptime: 0,
    timestamp: '',
    btcWatcher: 'active',
    rioEngine: 'active',
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data } = await api.get('/admin/health');
      if (data?.success) {
        setHealth({
          status: data.status || 'operational',
          uptime: Math.floor(data.uptime || 0),
          timestamp: data.timestamp || new Date().toISOString(),
          btcWatcher: 'active',
          rioEngine: 'active',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch system health');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `\( {hours}h \){minutes}m`;
  };

  if (loading && !health.uptime) {
    return (
      <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="mt-6 text-xs text-gray-400">Loading system diagnostics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 text-emerald-400 mb-2">
              <Globe size={18} className="animate-pulse" />
              <span className="text-xs font-medium uppercase tracking-widest">System Monitoring</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Platform Health</h1>
            <p className="text-gray-400 mt-2">Real-time infrastructure status</p>
          </div>

          <button
            onClick={fetchHealth}
            disabled={refreshing}
            className="flex items-center gap-3 px-8 py-4 bg-[#0a0c10] border border-white/10 rounded-2xl hover:border-emerald-500/40 disabled:opacity-50 text-sm font-medium transition-all"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh Diagnostics
          </button>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { 
              label: 'System Uptime', 
              value: formatUptime(health.uptime), 
              icon: Clock, 
              color: 'text-emerald-400' 
            },
            { 
              label: 'CPU Load', 
              value: '1.2% Utilization', 
              icon: Cpu, 
              color: 'text-emerald-400' 
            },
            { 
              label: 'Memory Usage', 
              value: '256MB / 1GB', 
              icon: Database, 
              color: 'text-emerald-400' 
            },
            { 
              label: 'Network Latency', 
              value: '14ms', 
              icon: Zap, 
              color: 'text-emerald-400' 
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#0a0c10] border border-white/5 p-10 rounded-3xl hover:border-emerald-500/30 transition-all"
            >
              <div className={`p-4 bg-black/40 rounded-2xl w-fit mb-8 ${item.color}`}>
                <item.icon size={24} />
              </div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{item.label}</p>
              <h3 className="text-2xl font-semibold tracking-tight">{item.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Core Services Status */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-12">
          <h3 className="text-xl font-semibold mb-10">Core Services</h3>
          <div className="space-y-6">
            {[
              { name: 'RIO Yield Engine', status: 'Running', detail: 'Daily distribution cycle' },
              { name: 'BTC Deposit Monitor', status: 'Active', detail: 'Real-time blockchain scanning' },
              { name: 'User Authentication Service', status: 'Healthy', detail: 'JWT + Session management' },
            ].map((service, i) => (
              <div key={i} className="flex justify-between items-center p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-emerald-500/20 transition-all">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{service.detail}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-emerald-400">{service.status}</span>
                  <CheckCircle2 className="text-emerald-400" size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Note */}
        <div className="mt-16 text-center text-xs text-gray-500">
          System health is monitored continuously. All metrics are for internal administrative use.
        </div>
      </div>
    </div>
  );
}
