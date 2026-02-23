export const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-2xl" />
    ))}
    <div className="md:col-span-3 h-64 bg-white/5 border border-white/10 rounded-2xl" />
  </div>
);

