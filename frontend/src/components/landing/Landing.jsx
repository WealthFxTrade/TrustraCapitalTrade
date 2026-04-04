// src/components/landing/Landing.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import RoiCalculator from './RoiCalculator';

// ── ASSET CLASSES / TIERS ──
const ASSET_CLASSES = [
  { id: 'class1', name: 'Class I: Entry', yieldRange: '6–9%', min: 100, desc: 'Diversified Liquidity Access' },
  { id: 'class2', name: 'Class II: Core', yieldRange: '9–12%', min: 1000, desc: 'Enhanced Execution & Smart Routing' },
  { id: 'class3', name: 'Class III: Prime', yieldRange: '12–16%', min: 5000, desc: 'Priority Order Execution & Rebalancing' },
  { id: 'class4', name: 'Class IV: Institutional', yieldRange: '16–20%', min: 15000, desc: 'Dedicated Asset Validation & Governance' },
  { id: 'class5', name: 'Class V: Sovereign', yieldRange: '20–25%', min: 50000, desc: 'HFT Arbitrage & Institutional Dark Pools' },
];

// ── PERFORMANCE REVIEWS ──
const PERFORMANCE_REVIEWS = [
  { name: "Marcus Thorne", country: "United Kingdom", initial: "M", text: "The London execution protocol is exceptional. Our Class V allocation has maintained consistent alpha through multiple market cycles since 2019." },
  { name: "Sven Lindholm", country: "Sweden", initial: "S", text: "Grade-A precision. The automated liquidity management provided critical downside protection and reduced volatility during the Q1 market correction." },
  { name: "Elena Rossi", country: "Italy", initial: "E", text: "Finally, a terminal that respects European regulatory standards. High-speed execution and seamless daily settlements for our firm." },
  { name: "Jameson Vance", country: "USA", initial: "J", text: "Operating from the New York hub, the latency is practically zero. TrustraCapital is the 2026 benchmark for risk-adjusted yield." },
  { name: "Hiroshi Tanaka", country: "Japan", initial: "H", text: "The quantum strategies are legitimate. I've transitioned my entire institutional portfolio to their liquidity engine for optimized NAV growth." },
];

// ── MARKET ORACLE COMPONENT ──
const MarketOracle = () => {
  const [marketData, setMarketData] = useState({ rawPrice: 0, change: 0, low: 0, high: 0, currency: 'EUR', loading: true });
  const isMounted = useRef(true);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=bitcoin&price_change_percentage=24h');
      const data = await res.json();
      if (data?.[0] && isMounted.current) {
        const btc = data[0];
        setMarketData({
          rawPrice: btc.current_price,
          change: btc.price_change_percentage_24h,
          low: btc.low_24h,
          high: btc.high_24h,
          currency: marketData.currency,
          loading: false,
        });
      }
    } catch (err) {
      console.error("Oracle Sync Failure:", err);
      if (isMounted.current) setMarketData(prev => ({ ...prev, loading: false }));
    }
  }, [marketData.currency]);

  useEffect(() => {
    isMounted.current = true;
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => { isMounted.current = false; clearInterval(interval); };
  }, [fetchPrice]);

  const toggleCurrency = () => setMarketData(prev => ({ ...prev, currency: prev.currency === 'EUR' ? 'USD' : 'EUR' }));

  const formattedPrice = useMemo(() => {
    const rate = marketData.currency === 'USD' ? 1.09 : 1;
    const val = marketData.rawPrice * rate;
    return val.toLocaleString(
      marketData.currency === 'EUR' ? 'de-DE' : 'en-US',
      { style: 'currency', currency: marketData.currency, minimumFractionDigits: 0 }
    );
  }, [marketData.rawPrice, marketData.currency]);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a0c10] border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">XBT/{marketData.currency} VALUATION</h4>
          <p className="text-gray-500 text-[9px] uppercase font-bold tracking-tighter">Institutional Liquidity Stream</p>
        </div>
        <div className="text-right">
          <button onClick={toggleCurrency} className="text-2xl md:text-3xl font-black italic text-white tracking-tighter hover:text-emerald-500 transition-colors">
            {marketData.loading ? 'SYNCHRONIZING...' : formattedPrice}
          </button>
          <div className={`text-[10px] font-black mt-1 ${marketData.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {marketData.change >= 0 ? '+' : ''}{marketData.change.toFixed(2)}% <span className="opacity-40">/ 24H VARIANCE</span>
          </div>
        </div>
      </div>

      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
          <span className="block text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Intraday Support</span>
          <span className="text-xs font-bold">{marketData.low.toLocaleString()}</span>
        </div>
        <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
          <span className="block text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Intraday Resistance</span>
          <span className="text-xs font-bold">{marketData.high.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>EXECUTION ENGINE: ACTIVE</span>
        </div>
        <button onClick={toggleCurrency} className="text-emerald-500 hover:text-white transition-colors uppercase">
          Toggle {marketData.currency === 'EUR' ? 'USD' : 'EUR'}
        </button>
      </div>
    </motion.div>
  );
};

// ── LANDING PAGE ──
const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, initialized, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSupportClick = () => {
    window.open(`https://wa.me/18782241625?text=Hello%20TrustraCapital%20Support`, '_blank');
  };

  const handlePlanClick = (planId) => {
    navigate(`/register?plan=${planId}`);
  };

  if (!initialized) return <div className="min-h-screen bg-[#020408]" />;

  return (
    <div className="min-h-screen bg-[#020408] text-white font-sans antialiased overflow-x-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 md:px-20">
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">TRUSTRACAPITAL</h1>
        <p className="text-gray-400 max-w-xl mb-8">
          Strategic Asset Management Since 2016<br />
          Optimized Alpha via Quantitative Strategy
        </p>
        <p className="text-gray-500 max-w-2xl mb-10">
          Access institutional-grade capital management. Trustra utilizes proprietary high-frequency quantitative strategies to capture market inefficiencies across global liquidity pools and private execution venues.
        </p>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-gray-400 mb-10">
          <div>
            <p className="text-4xl font-black text-white">€2.4B+</p>
            <p className="uppercase font-bold text-sm tracking-widest">AUM</p>
          </div>
          <div>
            <p className="text-4xl font-black text-white">99.99%</p>
            <p className="uppercase font-bold text-sm tracking-widest">Operational Uptime</p>
          </div>
          <div>
            <p className="text-4xl font-black text-white">412</p>
            <p className="uppercase font-bold text-sm tracking-widest">Active Portfolios</p>
          </div>
        </div>

        {/* Hero Buttons */}
        <div className="flex gap-4 flex-wrap justify-center">
          <button onClick={handleSupportClick} className="bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest transition">
            Request Consultation
          </button>
          <button onClick={() => navigate('/register')} className="border border-gray-500 px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:border-emerald-500 transition">
            Create Account
          </button>
          {!user && (
            <Link to="/login" className="border border-gray-500 px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:border-emerald-500 transition">
              Client Login
            </Link>
          )}
        </div>
      </section>

      {/* Asset Classes / ROI Plans */}
      <section className="px-6 md:px-20 py-20">
        <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">Strategic Capital Allocation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ASSET_CLASSES.map(asset => (
            <motion.div
              key={asset.id}
              className="bg-[#0a0c10] rounded-3xl p-8 border border-white/5 shadow-xl hover:shadow-emerald-500 transition cursor-pointer"
              whileHover={{ y: -5 }}
              onClick={() => handlePlanClick(asset.id)}
            >
              <h3 className="text-xl font-bold mb-2">{asset.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{asset.desc}</p>
              <p className="font-black text-2xl text-emerald-500">{asset.yieldRange}</p>
              <p className="text-gray-500 text-xs mt-2">Minimum: €{asset.min.toLocaleString()}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Market Oracle */}
      <section className="px-6 md:px-20 py-20">
        <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">XBT/EUR VALUATION</h2>
        <MarketOracle />
      </section>

      {/* ROI Calculator */}
      <section className="px-6 md:px-20 py-20">
        <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">Portfolio Performance Projection</h2>
        <RoiCalculator />
      </section>

      {/* Performance Reviews */}
      <section className="px-6 md:px-20 py-20">
        <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">Institutional Consensus</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PERFORMANCE_REVIEWS.map((review, idx) => (
            <motion.div key={idx} className="bg-[#0a0c10] p-6 rounded-3xl border border-white/5 shadow-xl hover:shadow-emerald-500 transition" whileHover={{ y: -5 }}>
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center font-black">{review.initial}</div>
                <div className="ml-4">
                  <p className="font-bold">{review.name}</p>
                  <p className="text-gray-400 text-sm">{review.country}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">{review.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#05070a] py-12 px-6 md:px-20 text-gray-500 text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p>&copy; {new Date().getFullYear()} TRUSTRA CAPITAL. All rights reserved.</p>
          <div className="flex gap-6">
            <button onClick={handleSupportClick} className="hover:text-emerald-500">WhatsApp / Support</button>
            <a href="mailto:infocare@gmail.com" className="hover:text-emerald-500">Email Support</a>
          </div>
        </div>
        <div className="mt-6 text-xs text-gray-400 text-center">
          Trustra Capital is a premier quantitative asset manager. Established 2016. Licensed and compliant under the 2024 SEC Digital Asset Framework. Digital asset investments carry inherent market risk.
        </div>
      </footer>

      {/* Floating Chat / Help Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <button
          onClick={handleSupportClick}
          className="bg-emerald-500 hover:bg-emerald-600 text-black px-5 py-3 rounded-full font-bold uppercase tracking-widest shadow-lg transition flex items-center gap-2"
        >
          WhatsApp
        </button>
        <button
          onClick={() => window.location.href = 'mailto:infocare@gmail.com'}
          className="bg-[#111315] hover:bg-[#1f2124] text-white px-5 py-3 rounded-full font-bold uppercase tracking-widest shadow-lg transition flex items-center gap-2"
        >
          Email Support
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
