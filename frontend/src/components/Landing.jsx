<<<<<<< HEAD
import { useEffect, useState } from 'react';

export default function Landing() {
  const [btcPrice, setBtcPrice] = useState('Loading...');

  // Fetch BTC price every 30 seconds
  useEffect(() => {
    async function updateBtcPrice() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
        );
        const data = await res.json();
        setBtcPrice(`1 BTC = $${data.bitcoin.usd.toLocaleString()}`);
      } catch (e) {
        setBtcPrice('Price unavailable');
      }
    }

    updateBtcPrice();
    const interval = setInterval(updateBtcPrice, 30000);

    return () => clearInterval(interval); // cleanup
=======
// src/components/Landing.jsx
import { useEffect } from 'react';

export default function Landing() {
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
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
  }, []);

  return (
    <>
      {/* Header / Navigation */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-400">TrustraCapital</div>
          <div className="flex items-center gap-6">
            <a href="#plans" className="hover:text-indigo-400 transition">Plans</a>
            <a href="#reviews" className="hover:text-indigo-400 transition">Reviews</a>
            <a href="/login" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">Login</a>
            <a href="/register" className="px-5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500 rounded-lg transition">Register</a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
<<<<<<< HEAD
      <section className="py-20 md:py-32 bg-gradient-to-b from-gray-950 to-gray-900 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          Invest in Bitcoin with Confidence<br/>
          <span className="text-indigo-400">Since 2016</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
          Join thousands of satisfied investors. Choose from 5 high-return Rio plans.
          Professional platform – secure wallets – fast withdrawals.
        </p>
        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <a href="/register" className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold rounded-xl transition shadow-lg">
            Invest Now
          </a>
          <a href="#plans" className="px-10 py-5 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white text-xl font-bold rounded-xl transition">
            View Plans
          </a>
=======
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
            <a href="/register" className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold rounded-xl transition shadow-lg">
              Invest Now
            </a>
            <a href="#plans" className="px-10 py-5 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white text-xl font-bold rounded-xl transition">
              View Plans
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Investment involves risk. Past performance is not indicative of future results.
          </p>
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Investment involves risk. Past performance is not indicative of future results.
        </p>
      </section>

<<<<<<< HEAD
      {/* Bitcoin Price */}
      <section className="py-12 bg-gray-900 border-t border-gray-800 text-center">
        <h2 className="text-3xl font-bold mb-6">Current Bitcoin Price</h2>
        <div className="text-5xl font-mono font-bold text-green-400">{btcPrice}</div>
        <p className="mt-3 text-gray-500">Updated every 30 seconds • Data from CoinGecko</p>
=======
      {/* Live Bitcoin Price Widget */}
      <section className="py-12 bg-gray-900 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Current Bitcoin Price</h2>
          <div id="btc-price-widget" className="text-5xl font-mono font-bold text-green-400">
            Loading...
          </div>
          <p className="mt-3 text-gray-500">Updated every 30 seconds &quot; Data from CoinGecko</p>
        </div>
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">5 Rio Investment Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
<<<<<<< HEAD
            {/* Plan Cards - copy/paste as needed */}
            <PlanCard title="Rio Starter" range="$100 – $999" percent="12% – 18% monthly" features={['Daily accrual', 'Instant deposit', '30-day lock']} />
            <PlanCard title="Rio Basic" range="$1,000 – $4,999" percent="18% – 25% monthly" features={['Daily accrual', 'Instant deposit', '45-day lock']} />
            <PlanCard title="Rio Pro" range="$5,000 – $9,999" percent="25% – 32% monthly" features={['Daily accrual', 'Instant deposit', '60-day lock']} />
            <PlanCard title="Rio Elite" range="$10,000 – $49,999" percent="32% – 40% monthly" features={['Daily accrual', 'Instant deposit', '90-day lock']} />
            <PlanCard title="Rio Infinity" range="$50,000 +" percent="45% monthly" features={['Daily accrual', 'Instant deposit', 'No lock period']} />
=======
            {/* Plan 1 - Rio Starter */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-indigo-600/40 hover:border-indigo-500 transition shadow-xl hover:shadow-indigo-500/20">
              <h3 className="text-2xl font-bold text-indigo-400 mb-4">Rio Starter</h3>
              <div className="text-5xl font-bold mb-2">$100 – $999</div>
              <div className="text-2xl text-green-400 mb-6">6% – 9% monthly</div>
              <ul className="text-gray-300 space-y-3 mb-8">
                <li>✓ Daily accrual</li>
                <li>✓ Instant deposit</li>
                <li>✓ 30-day lock</li>
              </ul>
              <a href="/register" className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-center font-bold transition">
                Invest Now
              </a>
            </div>

            {/* Plan 2 - Rio Basic */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-indigo-600/40 hover:border-indigo-500 transition shadow-xl hover:shadow-indigo-500/20">
              <h3 className="text-2xl font-bold text-indigo-400 mb-4">Rio Basic</h3>
              <div className="text-5xl font-bold mb-2">$1,000 – $4,999</div>
              <div className="text-2xl text-green-400 mb-6">9% – 12% monthly</div>
              <ul className="text-gray-300 space-y-3 mb-8">
                <li>✓ Daily accrual</li>
                <li>✓ Priority support</li>
                <li>✓ 30-day lock</li>
              </ul>
              <a href="/register" className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-center font-bold transition">
                Invest Now
              </a>
            </div>

            {/* Plan 3 - Rio Standard */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-indigo-600/40 hover:border-indigo-500 transition shadow-xl hover:shadow-indigo-500/20">
              <h3 className="text-2xl font-bold text-indigo-400 mb-4">Rio Standard</h3>
              <div className="text-5xl font-bold mb-2">$5,000 – $14,999</div>
              <div className="text-2xl text-green-400 mb-6">12% – 16% monthly</div>
              <ul className="text-gray-300 space-y-3 mb-8">
                <li>✓ Account manager</li>
                <li>✓ 45-day lock</li>
                <li>✓ Daily accrual</li>
              </ul>
              <a href="/register" className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-center font-bold transition">
                Invest Now
              </a>
            </div>

            {/* Plan 4 - Rio Advanced */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-indigo-600/40 hover:border-indigo-500 transition shadow-xl hover:shadow-indigo-500/20">
              <h3 className="text-2xl font-bold text-indigo-400 mb-4">Rio Advanced</h3>
              <div className="text-5xl font-bold mb-2">$15,000 – $49,999</div>
              <div className="text-2xl text-green-400 mb-6">16% – 20% monthly</div>
              <ul className="text-gray-300 space-y-3 mb-8">
                <li>✓ Premium support</li>
                <li>✓ 60-day lock</li>
                <li>✓ Daily accrual</li>
              </ul>
              <a href="/register" className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-center font-bold transition">
                Invest Now
              </a>
            </div>

            {/* Plan 5 - Rio Elite */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-indigo-600/40 hover:border-indigo-500 transition shadow-xl hover:shadow-indigo-500/20">
              <h3 className="text-2xl font-bold text-indigo-400 mb-4">Rio Elite</h3>
              <div className="text-5xl font-bold mb-2">$50,000+</div>
              <div className="text-2xl text-green-400 mb-6">20% – 25% monthly</div>
              <ul className="text-gray-300 space-y-3 mb-8">
                <li>✓ VIP management</li>
                <li>✓ 90-day lock</li>
                <li>✓ Daily accrual</li>
              </ul>
              <a href="/register" className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-center font-bold transition">
                Invest Now
              </a>
            </div>
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-gray-900 border-t border-gray-800">
<<<<<<< HEAD
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-16">What Our Investors Say</h2>
          <Reviews />
=======
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">What Our Investors Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-300 mb-6">&quot;Fast withdrawals and clear profit tracking.&quot;</p>
              <p className="text-right font-bold text-indigo-400">– James K., USA</p>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-300 mb-6">&quot;Reliable platform with professional support.&quot;</p>
              <p className="text-right font-bold text-indigo-400">– Liam O., UK</p>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-300 mb-6">&quot;Consistent performance and secure system.&quot;</p>
              <p className="text-right font-bold text-indigo-400">– Daniel M., Germany</p>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-300 mb-6">&quot;Very transparent investment process.&quot;</p>
              <p className="text-right font-bold text-indigo-400">– Marco R., Italy</p>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-300 mb-6">&quot;Excellent experience for long-term investing.&quot;</p>
              <p className="text-right font-bold text-indigo-400">– Kenji T., Japan</p>
            </div>
          </div>
>>>>>>> 30b56e1 (Add full functionality: auth, dashboard, deposit/withdraw, transaction history, profit accrual, KYC)
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-12 border-t border-gray-800 text-center text-gray-500 text-sm">
        <div className="max-w-4xl mx-auto px-4">
          <p className="mb-4">
            <strong>Investment Risk Disclaimer:</strong> Cryptocurrency investments carry significant risk. You may lose some or all of your invested capital. Past performance is not indicative of future results. TrustraCapitalTrade operates since 2016 and is not responsible for investment losses.
          </p>
          <p>&copy; 2016–2026 TrustraCapitalTrade. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

// Reusable PlanCard component
function PlanCard({ title, range, percent, features }) {
  return (
    <div className="bg-gray-800 rounded-2xl p-8 border border-indigo-600/40 hover:border-indigo-500 transition shadow-xl hover:shadow-indigo-500/20">
      <h3 className="text-2xl font-bold text-indigo-400 mb-4">{title}</h3>
      <div className="text-5xl font-bold mb-2">{range}</div>
      <div className="text-2xl text-green-400 mb-6">{percent}</div>
      <ul className="text-gray-300 space-y-3 mb-8">
        {features.map((f, i) => <li key={i}>✓ {f}</li>)}
      </ul>
      <a href="/register" className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-center font-bold transition">
        Invest Now
      </a>
    </div>
  );
}

// Sample Reviews component
function Reviews() {
  const data = [
    { text: 'Best investment decision in years. Withdrawals are fast and reliable.', name: 'James K., USA' },
    { text: 'Professional team and secure platform. Highly recommend!', name: 'Maria L., UK' },
    { text: 'Returns are consistent and support is excellent.', name: 'Ahmed S., UAE' },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {data.map((r, i) => (
        <div key={i} className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
          <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
          <p className="text-gray-300 mb-6">"{r.text}"</p>
          <p className="text-right font-bold text-indigo-400">– {r.name}</p>
        </div>
      ))}
    </div>
  );
            }
