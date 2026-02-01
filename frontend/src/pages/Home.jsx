import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getInvestmentPlans,
  getBtcPrice,
  getReviews,
} from '../api';

export default function Home() {
  const [plans, setPlans] = useState([]);
  const [btcPrice, setBtcPrice] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [plansRes, btcRes, reviewsRes] = await Promise.all([
          getInvestmentPlans(),
          getBtcPrice(),
          getReviews(),
        ]);

        setPlans(plansRes.data || []);
        setBtcPrice(btcRes.data?.price || null);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        console.error('Homepage data error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-gray-100">

      {/* HERO */}
      <section className="pt-32 pb-24 px-6 text-center">
        <h1 className="text-6xl md:text-8xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
          Trustra Capital Trade
        </h1>
        <p className="text-3xl md:text-4xl text-gray-300 mb-10 max-w-5xl mx-auto">
          Operating since 2016 • Secure High-Yield Cryptocurrency Investments
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            to="/signup"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-5 px-12 rounded-xl text-xl shadow-lg hover:scale-105 transition"
          >
            Start Investing Now
          </Link>
          <Link
            to="/login"
            className="border-2 border-cyan-500 text-cyan-400 py-5 px-12 rounded-xl text-xl hover:bg-cyan-500 hover:text-black transition"
          >
            Login to Dashboard
          </Link>
        </div>
      </section>

      {/* BTC PRICE */}
      <section className="py-16 px-6 bg-slate-900/60 border-y border-slate-800 text-center">
        <h2 className="text-4xl font-bold mb-8">Live Bitcoin Price (USD)</h2>
        {loading ? (
          <p className="text-2xl text-gray-400">Loading...</p>
        ) : (
          <p className="text-6xl md:text-8xl font-bold">
            {btcPrice ? `$${btcPrice.toLocaleString()}` : 'Unavailable'}
          </p>
        )}
      </section>

      {/* INVESTMENT PLANS */}
      <section className="py-20 px-6">
        <h2 className="text-5xl font-bold text-center mb-16 text-cyan-400">
          Investment Plans
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col hover:scale-[1.03] transition"
            >
              <h3 className="text-3xl font-bold mb-4">{plan.name}</h3>
              <p className="text-gray-300 mb-4">{plan.description}</p>

              <p className="text-4xl font-extrabold mb-4">
                {plan.dailyRoi}% <span className="text-xl">daily</span>
              </p>

              <div className="space-y-2 text-gray-300 mb-6">
                <p>Min: ${plan.minAmount.toLocaleString()}</p>
                <p>Max: {plan.maxAmount ? `$${plan.maxAmount.toLocaleString()}` : 'No limit'}</p>
                <p>Duration: {plan.durationDays} days</p>
              </div>

              <Link
                to="/signup"
                className="mt-auto bg-cyan-500 text-black py-3 rounded-xl font-bold text-center hover:bg-cyan-400 transition"
              >
                Invest Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-20 px-6 bg-slate-900/50 border-t border-slate-800">
        <h2 className="text-4xl font-bold text-center text-cyan-400 mb-12">
          Trusted by Investors Worldwide
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {reviews.map((r) => (
            <div key={r._id} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <p className="text-gray-300 mb-4">“{r.message}”</p>
              <p className="font-bold">{r.name}</p>
              <p className="text-sm text-gray-400">{r.country}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RISK DISCLAIMER */}
      <section className="py-16 px-6 bg-black border-t border-slate-800">
        <div className="max-w-5xl mx-auto text-sm text-gray-400">
          <h3 className="text-lg font-bold text-white mb-4">
            Risk Disclaimer
          </h3>
          <p>
            Cryptocurrency trading and digital asset investments involve
            substantial risk and may result in partial or total loss of capital.
            Past performance does not guarantee future results. Trustra Capital
            Trade does not provide financial advice. Investors should conduct
            their own due diligence and consult a licensed financial advisor
            before investing.
          </p>
        </div>
      </section>

    </div>
  );
}
