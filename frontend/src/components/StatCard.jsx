export default function StatCard({ label, value }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <p className="text-gray-400 mb-2">{label}</p>
      <p className="text-3xl font-bold text-cyan-400">{value}</p>
    </div>
  );
}
