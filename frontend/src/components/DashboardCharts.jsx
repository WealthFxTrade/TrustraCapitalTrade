import React from 'react';
import Chart from 'react-apexcharts';
import { TrendingUp, PieChart } from 'lucide-react';

const defaultColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default React.memo(function DashboardCharts({
  btcHistory = [],
  portfolioHistory = [],
  btcPrice = 0,
  plans = []
}) {
  // ---------- Area Chart ----------
  const areaOptions = {
    chart: {
      id: 'main-market',
      toolbar: { show: false },
      background: 'transparent',
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    colors: ['#6366f1', '#10b981'],
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] }
    },
    grid: { borderColor: '#1e293b', strokeDashArray: 4 },
    xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false }, tooltip: { enabled: false } },
    yaxis: {
      labels: {
        style: { colors: '#64748b', fontWeight: 600 },
        formatter: (val) => `$${Math.round(val).toLocaleString()}`
      }
    },
    tooltip: { theme: 'dark', x: { show: false }, style: { fontSize: '12px', fontFamily: 'Inter, sans-serif' } },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#94a3b8' },
      markers: { radius: 12 }
    },
    responsive: [{ breakpoint: 768, options: { chart: { height: 240 } } }]
  };

  // ---------- Donut Chart ----------
  const pieColors = plans.length > 0
    ? plans.map((_, i) => defaultColors[i % defaultColors.length])
    : defaultColors;

  const pieOptions = {
    labels: plans.length > 0 ? plans.map(p => p.name) : ['No Active Plans'],
    colors: pieColors,
    legend: { show: true, position: 'bottom', labels: { colors: '#94a3b8' }, markers: { radius: 12 } },
    stroke: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { show: true, color: '#94a3b8' },
            value: { show: true, color: '#fff', fontSize: '20px', fontWeight: 'bold', formatter: (val) => `$${Number(val).toLocaleString()}` },
            total: {
              show: true,
              label: 'Allocated',
              color: '#64748b',
              formatter: (w) => `$${w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString()}`
            }
          }
        }
      }
    },
    tooltip: { theme: 'dark' },
    dataLabels: { enabled: false },
    responsive: [{ breakpoint: 768, options: { chart: { height: 260 } } }]
  };

  const pieSeries = plans.length > 0 ? plans.map(p => p.min || p.amount || 0) : [100];

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* Market Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 backdrop-blur-md p-6 rounded-[2rem] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <TrendingUp className="h-6 w-6 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-white font-bold text-xl tracking-tight">Market Analytics</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">2026 Real-Time Nodes</p>
          </div>
        </div>
        <div className="text-left md:text-right bg-slate-950/50 px-5 py-3 rounded-2xl border border-slate-800/50">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Live BTC/USD</p>
          <p className="text-3xl font-mono font-bold text-white tracking-tighter">
            ${(btcPrice || 77494).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Price Chart */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-800 shadow-2xl">
          <Chart
            options={areaOptions}
            series={[
              { name: 'BTC Market', data: btcHistory.length > 5 ? btcHistory : [77000, 77200, 77100, 77494, 77300, 77600] },
              { name: 'Portfolio', data: portfolioHistory.length > 5 ? portfolioHistory : [1200, 1250, 1230, 1280, 1260, 1310] }
            ]}
            type="area"
            height={320}
            aria-label="Market and Portfolio chart"
          />
        </div>

        {/* Allocation Donut Chart */}
        <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-800 shadow-2xl flex flex-col items-center">
          <div className="w-full flex items-center gap-2 mb-8">
            <PieChart className="h-4 w-4 text-indigo-400" />
            <h4 className="text-slate-300 font-bold text-[10px] uppercase tracking-[0.15em]">Plan Allocation</h4>
          </div>
          <div className="w-full">
            <Chart options={pieOptions} series={pieSeries} type="donut" height={340} aria-label="Plan allocation chart" />
          </div>
        </div>
      </div>
    </div>
  );
});
