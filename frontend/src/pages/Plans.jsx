// src/pages/Plans.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import BtcPrice from '@/components/BtcPrice';

const plans = [
  {
    name: 'Starter',
    min: 100,
    max: 999,
    roiDaily: 0.8,
    duration: 30,
    desc: 'Daily interest credited. Principal returned at maturity.',
    color: 'from-cyan-600 to-cyan-400',
  },
  {
    name: 'Silver',
    min: 1000,
    max: 4999,
    roiDaily: 1.2,
    duration: 45,
    desc: 'Balanced growth with higher daily returns.',
    color: 'from-blue-600 to-blue-400',
  },
  {
    name: 'Gold',
    min: 5000,
    max: 19999,
    roiDaily: 1.8,
    duration: 60,
    desc: 'Strong performer for mid-level investors.',
    color: 'from-purple-600 to-purple-400',
  },
  {
    name: 'Platinum',
    min: 20000,
    max: 99999,
    roiDaily: 2.5,
    duration: 90,
    desc: 'Premium returns for serious investors.',
    color: 'from-amber-600 to-amber-400',
  },
  {
    name: 'Diamond',
    min: 100000,
    max: Infinity,
    roiDaily: 3.5,
    duration: 120,
    desc: 'Elite tier with maximum yield.',
    color: 'from-rose-600 to-rose-400',
  },
];

export default function Plans() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-gray-100">
      {/* Hero Section */}
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
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-5 px-12 rounded-xl text-xl shadow-lg transition transform hover:scale-105"
          >
            Start Investing Now
          </Link>
          <Link
            to="/login"
            className="border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black font-bold py-5 px-12 rounded-xl text-xl transition"
          >
            Login to Dashboard
          </Link>
        </div>
      </section>

      {/* BTC Price Section */}
      <section className="py-16 px-6 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Live Bitcoin Price (USD)</h2>
          <BtcPrice className="inline-block text-6xl md:text-8xl" />
        </div>
      </section>

      {/* Investment Plans Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 text-cyan-400">
            Our 5 Investment Plans
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-gradient-to-br ${plan.color} bg-opacity-10 border border-opacity-30 border-gray-600 rounded-2xl p-8 hover:scale-[1.03] transition-transform duration-300 flex flex-col`}
              >
                <h3 className="text-3xl font-bold mb-4 text-white">{plan.name}</h3>
                <p className="text-gray-300 mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <p className="text-4xl font-extrabold text-white">
                    {plan.roiDaily}% <span className="text-2xl">daily</span>
                  </p>
                  <p className="text-lg text-gray-300 mt-1">ROI • Compounded daily</p>
                </div>
                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Minimum</span>
                    <span className="font-bold text-white">${plan.min.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Maximum</span>
                    <span className="font-bold text-white">
                      {plan.max === Infinity ? 'No limit' : `$${plan.max.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Duration</span>
                    <span className="font-bold text-white">{plan.duration} days</span>
                  </div>
                </div>
                <Link
                  to="/signup"
                  className="mt-auto bg-white/90 hover:bg-white text-black font-bold py-4 px-8 rounded-xl text-center transition"
                >
                  Invest Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
