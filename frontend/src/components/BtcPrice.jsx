export default function BtcPrice({ className = '' }) {
  // Mock for now – add real CoinGecko fetch later
  return (
    <div className={`text-5xl md:text-7xl font-bold text-cyan-400 tracking-tight ${className}`}>
      $102,345.67
      <span className="text-2xl md:text-3xl text-green-400 ml-4">+3.2% (24h)</span>
    </div>
  )
}
