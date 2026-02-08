import React, { useState, useEffect } from 'react';

const LandingPage = () => {
  const [btcPrice, setBtcPrice] = useState(64250.00); 

  useEffect(() => {
    // Basic price fluctuation simulation
    const interval = setInterval(() => {
      setBtcPrice(prev => prev + (Math.random() * 12 - 6));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const plans = [
    { name: "Rio Starter", range: "€100 – €999", return: "6% - 9%", color: "bg-blue-50" },
    { name: "Rio Basic", range: "€1,000 – €4,999", return: "9% - 12%", color: "bg-blue-100" },
    { name: "Rio Standard", range: "€5,000 – €14,999", return: "12% - 16%", color: "bg-blue-200" },
    { name: "Rio Advanced", range: "€15,000 – €49,999", return: "16% - 20%", color: "bg-blue-600 text-white" },
    { name: "Rio Elite", range: "€50,000+", return: "20% - 25%", color: "bg-slate-900 text-white" },
  ];

  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 border-b sticky top-0 bg-white z-50">
        <div className="text-2xl font-bold tracking-tighter text-blue-700">TrustraCapital</div>
        <div className="space-x-4">
          <button className="text-sm font-semibold hover:text-blue-600 transition">Login</button>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition">
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-24 px-8 text-center max-w-5xl mx-auto">
        <h1 className="text-6xl font-black mb-6 tracking-tight">Invest in Bitcoin with Confidence</h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Since 2016, we have helped investors scale capital through institutional-grade automated trading strategies.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-transform">
            Get Started
          </button>
          <button className="border border-gray-300 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition">
            View Plans
          </button>
        </div>
      </header>

      {/* Price Ticker */}
      <div className="bg-slate-900 py-6 text-center shadow-inner">
        <p className="text-xs text-blue-400 uppercase tracking-widest font-bold mb-1">Live Market Price (EUR)</p>
        <p className="text-4xl font-mono font-bold text-white">
          1 BTC = €{btcPrice.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </p>
        <p className="text-[10px] text-gray-500 mt-2">Real-time data provided by CoinGecko</p>
      </div>

      {/* Investment Plans */}
      <section className="py-24 px-8 max-w-7xl mx-auto bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold mb-4">Institutional Investment Tiers</h2>
          <div className="h-1 w-20 bg-blue-600 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {plans.map((plan, idx) => (
            <div key={idx} className={`${plan.color} p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col justify-between hover:shadow-2xl transition-shadow`}>
              <div>
                <h3 className="font-bold text-sm uppercase tracking-widest mb-2 opacity-80">{plan.name}</h3>
                <p className="text-2xl font-black mb-6">{plan.range}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Monthly Target</p>
                <p className="text-2xl font-black">{plan.return}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-16 px-8 border-t">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <h4 className="font-black text-xl mb-6 text-blue-700">TrustraCapital</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Leading the way in secure, automated digital asset management since 2016.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">Direct Contact</h4>
            <p className="text-sm text-gray-600 mb-2"><strong>Support:</strong> www.infocare@gmail.com</p>
            <p className="text-sm text-gray-600"><strong>Phone:</strong> +1 (878) 224-1625</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">Global HQ</h4>
            <address className="not-italic text-sm text-gray-600 leading-relaxed">
              One World Trade Center, Suite 85<br />
              New York, NY 10007, USA
            </address>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t">
          <div className="text-[11px] text-gray-400 text-center leading-relaxed max-w-4xl mx-auto">
            <p className="mb-4">
              <strong>Risk Disclosure:</strong> Cryptocurrency investments carry a high degree of risk. Past performance is not indicative of future results. 
              TrustraCapital is not a bank and digital assets are not insured by the FDIC or any government agency.
            </p>
            <p>© 2016–2026 TrustraCapital Global Trade. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

