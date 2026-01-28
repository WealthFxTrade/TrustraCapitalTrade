// src/components/Landing.jsx
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const updateBtcPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await res.json();
        const widget = document.getElementById('btc-price-widget');
        if (widget) {
          widget.innerHTML = `1 BTC = $${data.bitcoin.usd.toLocaleString()}`;
        }
      } catch (e) {
        const widget = document.getElementById('btc-price-widget');
        if (widget) {
          widget.innerHTML = 'Price unavailable';
        }
      }
    };

    updateBtcPrice();
    const interval = setInterval(updateBtcPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Navigate to register with pre-selected plan
  const goToRegisterWithPlan = (planName) => {
    navigate('/register', { state: { selectedPlan: planName } });
  };

  return (
    <>
      {/* Header / Navigation */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-400">TrustraCapital</div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => scrollToSection('plans')}
              className="hover:text-indigo-400 transition cursor-pointer bg-transparent border-none text-white"
            >
              Plans
            </button>
            <button
              onClick={() => scrollToSection('reviews')}
              className="hover:text-indigo-400 transition cursor-pointer bg-transparent border-none text-white"
            >
              Reviews
            </button>
            <Link to="/login" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
              Login
            </Link>
            <Link to="/register" className="px-5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500 rounded-lg transition">
              Register
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            Invest in Bitcoin with Confidence<br />
            <span className="text-indigo-400">Since 2016</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Join thousands of satisfied investors. Choose from 5 high-return Rio investment plans. Secure wallets, daily accruals, fast withdrawals.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold rounded-xl transition shadow-lg cursor-pointer border-none"
            >
              Invest Now
            </button>
            <button
              onClick={() => scrollToSection('plans')}
              className="px-10 py-5 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white text-xl font-bold rounded-xl transition cursor-pointer border-none"
            >
              View Plans
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Investment involves risk. Past performance is not indicative of future results.
          </p>
        </div>
      </section>

      {/* Live Bitcoin Price Widget */}
      <section className="py-12 bg-gray-900 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Current Bitcoin Price</h2>
          <div id="btc-price-widget" className="text-5xl font-mono font-bold text-green-400">
            Loading...
          </div>
          <p className="mt-3 text-gray-500">Updated every 30 seconds &quot; Data from CoinGecko</p>
        </div>
      </section>

      {/* 5 Rio Plans */}
      <section id="plans" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">5 Rio Investment Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {/* Plan 1 */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-indigo-600/40 hover:border-indigo-500 transition shadow-xl hover:shadow-indigo-500/20">
              <h3 className="text-2xl font-bold text-indigo-400 mb-4">Rio Starter</h3>
              <div className="text-5xl font-bold mb-2">$100 – $999</div>
              <div className="text-2xl text-green-400 mb-6">6% – 9% monthly</div>
              <ul className="text-gray-300 space-y-3 mb-8">
                <li>✓ Daily accrual</li>
                <li>✓ Instant deposit</li>
                <li>✓ 30-day lock</li>
              </ul>
              <button
                onClick={() => goToRegisterWithPlan('Rio Starter')}
                className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-center font-bold transition border-none cursor-pointer"
              >
                Invest Now
              </button>
            </div>

            {/* Plan 2 */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-indigo-600/40 hover:border-indigo-500 transition shadow-xl hover:shadow-indigo-500/20">
              <h3 className="text-2xl font-bold text-indigo-400 mb-4">Rio Basic</h3>
              <div className="text-5xl font-bold mb-2">$1,000 – $4,999</div>
              <div className="text-2xl text-green-400 mb-6">9% – 12% monthly</div>
              <ul className="text-gray-300 space-y-3 mb-8">
                <li>✓ Daily accrual</li>
                <li>✓ Priority support</li>
                <li>✓ 30-day lock</li>
              </ul>
              <button
                onClick={() => goToRegisterWithPlan('Rio Basic')}
                className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-center font-bold transition border-none cursor-pointer"
              >
                Invest Now
              </button>
            </div>

            {/* Plan 3 */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-indigo-600/40 hover:border-indigo-500 transition shadow-xl hover:shadow-indigo-500/20">
              <h3 className="text-2xl font-bold text-indigo-400 mb-4">Rio Standard</h3>
              <div className="text-5xl font-bold mb-2">$5,000 – $14,999</div>
              <div className="text-2xl text-green-400 mb-6">12% – 16% monthly</div>
              <ul className="text-gray-300 space-y-3 mb-8">
                <li>✓ Account manager</li>
                <li>✓ 45-day lock</li>
                <li>✓ Daily accrual</li>
              </ul>
              <button
                onClick={() => goToRegisterWithPlan('Rio Standard')}
                className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-center font-bold transition border-none cursor-pointer"
              >
                Invest Now
              </button>
            </div>

            {/* Plan 4 */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-indigo-600/40 hover:border-indigo-500 transition shadow-xl hover:shadow-indigo-500/20">
              <h3 className="text-2xl font-bold text-indigo-400 mb-4">Rio Advanced</h3>
              <div className="text-5xl font-bold mb-2">$15,000 – $49,999</div>
              <div className="text-2xl text-green-400 mb-6">16% – 20% monthly</div>
              <ul className="text-gray-300 space-y-3 mb-8">
                <li>✓ Premium support</li>
                <li>✓ 60-day lock</li>
                <li>✓ Daily accrual</li>
              </ul>
              <button
                onClick={() => goToRegisterWithPlan('Rio Advanced')}
                className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-center font-bold transition border-none cursor-pointer"
              >
                Invest Now
              </button>
            </div>

            {/* Plan 5 */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-indigo-600/40 hover:border-indigo-500 transition shadow-xl hover:shadow-indigo-500/20">
              <h3 className="text-2xl font-bold text-indigo-400 mb-4">Rio Elite</h3>
              <div className="text-5xl font-bold mb-2">$50,000+</div>
              <div className="text-2xl text-green-400 mb-6">20% – 25% monthly</div>
              <ul className="text-gray-300 space-y-3 mb-8">
                <li>✓ VIP management</li>
                <li>✓ 90-day lock</li>
                <li>✓ Daily accrual</li>
              </ul>
              <button
                onClick={() => goToRegisterWithPlan('Rio Elite')}
                className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-center font-bold transition border-none cursor-pointer"
              >
                Invest Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">What Our Investors Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-300 mb-6">&quot;Fast withdrawals and clear profit tracking.&quot;</p>
              <p className="text-right font-bold text-indigo-400">– James K., USA</p>
            </div>
            {/* Repeat for other 4 reviews */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-12 border-t border-gray-800 text-center text-gray-500 text-sm">
        <div className="max-w-4xl mx-auto px-4">
          <p className="mb-4">
            <strong>Investment Risk Disclaimer:</strong> Cryptocurrency investments carry significant risk. You may lose some or all of your invested capital. Past performance is not indicative of future results. TrustraCapitalTrade operates since 2016 and is not responsible for investment losses.
          </p>
          <p>© 2016–2026 TrustraCapitalTrade. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
