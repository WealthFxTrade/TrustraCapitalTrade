import React from 'react';
import Chart from 'react-apexcharts';
import { TrendingUp, PieChart } from 'lucide-react';

export default function DashboardCharts({ btcHistory = [], portfolioHistory = [], btcPrice = 0, plans = [] }) {
  
  // 1. AREA CHART CONFIG (Market Flux)
  const areaOptions = {
    chart: { 
      id: 'main-market', 
      toolbar: { show: false }, 
      background: 'transparent', 
      foreColor: '#64748b',
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    colors: ['#6366f1', '#10b981'],
    stroke: { curve: 'smooth', width: 3 },
    fill: { 
      type: 'gradient', 
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [20, 100] } 
    },
    grid: { borderColor: '#1e293b', strokeDashArray: 4 },
    xaxis: { 
      labels: { show: false }, 
      axisBorder: { show: false }, 
      axisTicks: { show: false },
      tooltip: { enabled: false }
    },
    yaxis: { 
      labels: { 
        style: { colors: '#64748b', fontWeight: 600 },
        formatter: (val) => `$${Math.round(val).toLocaleString()}` 
      } 
    },
    tooltip: { theme: 'dark', x: { show: false } },
    legend: { show: true, position: 'top', horizontalAlign: 'right', labels: { colors: '#94a3b8' } }
  };

  // 2. DONUT CHART CONFIG (Asset Allocation)
  const pieOptions = {
    labels: plans.length > 0 ? plans.map(p => p.name) : ['No Active Plans'],
    colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    legend: { show: true, position: 'bottom', labels: { colors: '#94a3b8' } },
    stroke: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { show: true, color: '#94a3b8' },
            value: { show: true, color: '#fff', fontSize: '20px', fontWeight: 'bold' },
            total: { show: true, label: 'Allocated', color: '#64748b' }
          }
        }
      }
    },
    tooltip: { theme: 'dark' },
    dataLabels: { enabled: false },
  };

  // Prevent crash if data is missing
  const pieSeries = plans.length > 0 ? plans.map(p => p.min || 0) : [100];

  return (
    <div className="space-y-6">
      {/* Market Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-2xl">
            <TrendingUp className="h-6 w-6 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-white font-bold text-xl tracking-tight">Market Analytics</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">2026 Real-Time Nodes</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Live BTC/USD</p>
          <p className="text-3xl font-mono font-bold text-white tracking-tighter">
            ${(btcPrice || 77494).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Price Chart */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl relative">
          <Chart
            options={areaOptions}
            series={[
              { name: 'BTC Market', data: btcHistory.length > 0 ? btcHistory : [77000, 77200, 77100, 77494] },
              { name: 'Portfolio', data: portfolioHistory.length > 0 ? portfolioHistory : [1200, 1250, 1230, 1280] },
            ]}
            type="area"
            height={320}
          />
        </div>

        {/* Allocation Donut */}
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col justify-between items-center">
          <div className="w-full flex items-center gap-2 mb-6">
            <PieChart className="h-4 w-4 text-indigo-400" />
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Plan Allocation</h4>
          </div>
          <div className="w-full">
            <Chart options={pieOptions} series={pieSeries} type="donut" height={320} />
          </div>
        </div>
      </div>
    </div>
  );
}

