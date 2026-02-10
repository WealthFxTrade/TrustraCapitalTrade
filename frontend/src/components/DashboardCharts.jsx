import React, { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { TrendingUp, TrendingDown, PieChart, Activity } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const TIME_RANGES = ['1D', '7D', '1M', 'YTD'];
const FX_RATES = { '€': 1, '$': 1, '£': 0.86 }; // USD base

export default React.memo(function DashboardCharts({
  btcHistory = [],
  portfolioHistory = [],
  plans = [],
  currency = '€',
}) {
  const [range, setRange] = useState('7D');
  const [btcPrice, setBtcPrice] = useState(null);

  /* ---------------- WebSocket BTC ---------------- */
  useEffect(() => {
    const ws = new WebSocket(
      'wss://stream.binance.com:9443/ws/btcusdt@trade'
    );

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (!data?.p) return;

        const usdPrice = Number(data.p);
        const converted =
          usdPrice * (FX_RATES[currency] / FX_RATES['$']);

        setBtcPrice(converted);
      } catch {
        /* silent */
      }
    };

    ws.onerror = () => {
      if (btcHistory.length) {
        setBtcPrice(btcHistory.at(-1));
      }
    };

    return () => ws.close();
  }, [btcHistory, currency]);

  /* ---------------- Helpers ---------------- */
  const sliceByRange = (data) => {
    if (!data.length) return [];
    const map = { '1D': 24, '7D': 7, '1M': 30, 'YTD': data.length };
    return data.slice(-map[range]);
  };

  const btcData = sliceByRange(btcHistory);
  const portfolioData = sliceByRange(portfolioHistory);

  /* ---------------- PnL ---------------- */
  const start = portfolioData[0] ?? 0;
  const end = portfolioData.at(-1) ?? 0;
  const pnl = end - start;
  const pnlPct = start ? (pnl / start) * 100 : 0;
  const isUp = pnl >= 0;

  /* ---------------- Area Chart ---------------- */
  const areaOptions = useMemo(() => ({
    chart: {
      id: 'market-pulse',
      toolbar: { show: false },
      background: 'transparent',
      animations: { easing: 'linear', speed: 900 },
    },
    colors: ['#6366f1', '#10b981'],
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: { opacityFrom: 0.4, opacityTo: 0.05 },
    },
    grid: { borderColor: '#1e293b', strokeDashArray: 4 },
    xaxis: { labels: { show: false }, axisBorder: { show: false } },
    yaxis: {
      labels: {
        style: { colors: '#64748b', fontWeight: 700 },
        formatter: (v) => `${currency}${Math.round(v).toLocaleString()}`,
      },
    },
    tooltip: { theme: 'dark', x: { show: false } },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#94a3b8' },
    },
  }), [currency]);

  /* ---------------- Donut ---------------- */
  const hasPlans = plans.some(p => (p.amount ?? p.min ?? 0) > 0);

  const pieOptions = useMemo(() => ({
    labels: hasPlans ? plans.map(p => p.name) : ['Ready for Node'],
    colors: COLORS,
    stroke: { show: false },
    legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Allocated',
              formatter: (w) =>
                `${currency}${w.globals.seriesTotals
                  .reduce((a, b) => a + b, 0)
                  .toLocaleString()}`,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
  }), [plans, currency, hasPlans]);

  /* ---------------- Render ---------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 p-6 rounded-[2.5rem] border border-slate-800 flex justify-between items-center backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <Activity className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-white text-xl font-black uppercase tracking-tight">
              Market Pulse
            </h3>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">
              Node Cluster Active
            </p>
          </div>
        </div>

        <div className="text-right bg-black/40 px-6 py-3 rounded-2xl border border-white/5">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
            Live BTC
          </p>
          <p className="text-3xl font-mono font-black text-white">
            {btcPrice
              ? `${currency}${btcPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              : 'SYNCING'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800">
          <div className="flex justify-between mb-6">
            <div className="flex gap-2">
              {TIME_RANGES.map(r => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-4 py-1 text-[10px] font-black rounded-full
                    ${range === r
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-500'}`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className={`flex items-center gap-1 text-xs font-black ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {pnlPct.toFixed(2)}%
            </div>
          </div>

          <Chart
            options={areaOptions}
            series={[
              { name: 'BTC Trend', data: btcData },
              { name: 'Portfolio', data: portfolioData },
            ]}
            type="area"
            height={320}
          />
        </div>

        <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="h-4 w-4 text-blue-500" />
            <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Node Allocation
            </h4>
          </div>

          {hasPlans ? (
            <Chart
              options={pieOptions}
              series={plans.map(p => p.amount ?? p.min ?? 0)}
              type="donut"
              height={300}
            />
          ) : (
            <p className="text-slate-600 text-xs font-black uppercase text-center mt-24">
              No Active Yield Nodes
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
