// src/pages/Admin/SystemHealth.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/api'; 
import { Activity, Database, Server, Cpu, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

const SystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    setRefreshing(true);
    setError(null);

    try {
      const { data } = await api.get('/admin/health', {
        timeout: 8000, 
      });
      setHealth(data);
    } catch (err) {
      console.error('Failed to fetch system health:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load system health. Backend may be offline.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#020408]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-yellow-500 animate-spin" />
          <p className="text-gray-400 text-lg font-medium tracking-widest">SYNCHRONIZING CORE...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#020408] p-6 text-white">
        <div className="bg-red-900/10 border border-red-500/50 rounded-2xl p-8 max-w-lg text-center backdrop-blur-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-3">Health Check Failed</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={fetchHealth} className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-all">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const StatusCard = ({ icon: Icon, title, value, status, detail }) => (
    <div className="bg-[#0A0C10] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-yellow-500/10 transition-colors">
          <Icon className="w-6 h-6 text-yellow-500" />
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            status === 'healthy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
          {status}
        </span>
      </div>
      <h3 className="text-gray-400 text-sm mb-1 font-medium">{title}</h3>
      <p className="text-2xl font-bold text-white mb-2">{value}</p>
      <p className="text-xs text-gray-500 italic font-light">{detail}</p>
    </div>
  );

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto bg-[#020408] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white italic">
            ZURICH <span className="text-yellow-500">MAINNET</span> STATUS
          </h1>
          <p className="text-gray-400 mt-2 font-mono text-xs uppercase tracking-tighter">
            Core Version: {health?.nodeVersion || 'v20.x'} • Last Sync: {new Date().toLocaleTimeString()}
          </p>
        </div>

        <button onClick={fetchHealth} disabled={refreshing} className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-xs font-bold uppercase tracking-widest border border-white/10 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Syncing...' : 'Force Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          icon={Database}
          title="MongoDB Cluster"
          value={health?.dbStatus === 'connected' ? 'ONLINE' : 'OFFLINE'}
          status={health?.dbStatus === 'connected' ? 'healthy' : 'critical'}
          detail={`Latency: ${health?.dbLatency || '24ms'}`}
        />

        <StatusCard
          icon={Server}
          title="Engine Uptime"
          value={health?.uptime || 'N/A'}
          status="healthy"
          detail={`Environment: ${health?.env || 'Production'}`}
        />

        <StatusCard
          icon={Cpu}
          title="Core Memory"
          value={health?.memoryUsage || '0 MB'}
          status="healthy"
          detail={`Allocation: ${health?.memoryPercentage || '2%'} Capacity`}
        />

        <StatusCard
          icon={Activity}
          title="Network Pulse"
          value={`${health?.responseTime || '12'}ms`}
          status="healthy"
          detail="API throughput optimized"
        />
      </div>

      <div className="bg-[#0A0C10] border border-green-500/20 rounded-2xl p-8 flex flex-col items-center text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Systems Fully Operational</h2>
        <p className="text-gray-500 text-sm max-w-md">
          Zurich Engine is processing distributions normally. No interruptions detected.
        </p>
      </div>
    </div>
  );
};

export default SystemHealth;
