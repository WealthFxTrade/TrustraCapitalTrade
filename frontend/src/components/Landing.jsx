import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Star, CheckCircle, ArrowRight } from 'lucide-react';
// Correctly import data and custom hook
import { landingHero, investmentPlans, testimonials, footer } from '../data/landingData';
import { useBtcPrice } from '../hooks/useBtcPrice';

export default function Landing() {
  // Use the custom hook with a 5-minute refresh interval
  const { price, loading } = useBtcPrice(300000);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-indigo-500/30">
      {/* Dynamic Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 transition hover:opacity-80">
            <TrendingUp className="h-8 w-8 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight">TrustraCapital</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-indigo-400 transition">Login</Link>
            <Link to="/register" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold text-sm transition shadow-lg shadow-indigo-600/20">
              Register
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
        {/* Hero Section using landingData */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent leading-tight">
          {landingHero.title}
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          {landingHero.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link to="/register" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/10">
            {landingHero.ctaPrimary} <ArrowRight className="h-5 w-5" />
          </Link>
          <a href="#plans" className="px-8 py-4 border border-slate-700 rounded-xl hover:bg-slate-900 transition font-bold">
            {landingHero.ctaSecondary}
          </a>
        </div>

        {/* Live BTC Price Widget with Hook Data */}
        <div className="mb-24 inline-block bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
          <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold mb-3">Live Market Price (USD)</p>
          {loading && !price ? (
            <div className="h-10 w-48 bg-slate-800 animate-pulse rounded-lg mx-auto" />
          ) : (
            <p className="text-4xl font-bold text-emerald-400 font-mono tracking-tighter">
              1 BTC = {price || '$77,494.65'}
            </p>
          )}
          <p className="text-[9px] text-slate-600 mt-2 italic">Real-time data provided by CoinGecko</p>
        </div>

        {/* Investment Plans Grid */}
        <section id="plans" className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 scroll-mt-24 mb-32">
          {investmentPlans.map((plan) => (
            <Link 
              to="/register" 
              key={plan.name} 
              className={`p-6 rounded-2xl border transition-all hover:-translate-y-2 text-left flex flex-col h-full ${
                plan.highlight 
                ? 'bg-indigo-900/20 border-indigo-500 shadow-2xl shadow-indigo-500/10' 
                : 'bg-slate-900/40 border-slate-800 hover:border-indigo-500/30'
              }`}
            >
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-slate-500 text-[10px] uppercase mb-6 tracking-widest font-bold">{plan.range}</p>
              <div className="mt-auto flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>{plan.returns}</span>
              </div>
            </Link>
          ))}
        </section>

        {/* Testimonials */}
        <section className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-20">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-slate-900/20 border border-slate-800/50 p-6 rounded-2xl flex flex-col text-left hover:bg-slate-900/40 transition">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-slate-400 text-xs italic mb-6 flex-1 leading-relaxed">"{t.quote}"</p>
              <div className="border-t border-slate-800/50 pt-4">
                <p className="text-[10px] font-bold text-indigo-400 tracking-wide uppercase">{t.author}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Corporate Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-20 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-8 opacity-40">
          <TrendingUp className="h-5 w-5 text-indigo-500" />
          <span className="font-bold text-sm tracking-widest uppercase">Trustra Capital Trade</span>
        </div>
        <p className="text-slate-500 text-xs mb-8">{footer.copyright}</p>
        <div className="max-w-2xl mx-auto p-5 border border-slate-800/40 rounded-xl bg-slate-950/40">
          <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] leading-loose">
            {footer.riskWarning}
          </p>
        </div>
      </footer>
    </div>
  );
}
