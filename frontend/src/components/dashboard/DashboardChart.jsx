import { lazy, Suspense } from "react";

const Chart = lazy(() => import("react-apexcharts"));

export default function DashboardChart({ data }) {
  const options = {
    chart: {
      id: "crypto-main-chart",
      toolbar: { show: false },
      background: "transparent",
      foreColor: "#94a3b8",
    },
    colors: ["#6366f1"],
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
      },
    },
    grid: {
      borderColor: "#1e293b",
      strokeDashArray: 4,
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    tooltip: { theme: "dark" },
  };

  const series = [
    {
      name: "Portfolio Value",
      data: [31000, 40000, 28000, 51000, 42000, 109000, 100000],
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white font-bold text-lg">Market Performance</h3>
          <p className="text-slate-500 text-sm">Real-time asset tracking</p>
        </div>
        <div className="text-right">
          <span className="text-green-400 font-bold">+12.5%</span>
        </div>
      </div>

      <Suspense fallback={<div className="h-[350px] bg-slate-800 rounded-xl" />}>
        <Chart options={options} series={series} type="area" height={350} />
      </Suspense>
    </div>
  );
}
