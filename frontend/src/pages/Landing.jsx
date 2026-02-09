// src/pages/Landing.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Landing() {
  const navigate = useNavigate();
  const [btcPrice, setBtcPrice] = useState(null);

  // Fetch live BTC price (EUR)
  useEffect(() => {
    const fetchBTC = async () => {
      try {
        const res = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur"
        );
        setBtcPrice(res.data.bitcoin.eur);
      } catch (err) {
        console.error("Failed to fetch BTC price:", err);
      }
    };
    fetchBTC();
    const interval = setInterval(fetchBTC, 30000); // update every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text px-4 sm:px-6 lg:px-20 py-10 space-y-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <h1 className="text-4xl font-bold text-white">TrustraCapital</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 rounded-4xl border border-primary text-primary hover:bg-primary/10 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-2 rounded-4xl bg-primary text-white hover:bg-primary-dark transition"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h2 className="text-3xl md:text-5xl font-bold text-white">
          Invest Smart. Trade Confident.
        </h2>
        <p className="text-text-muted max-w-2xl mx-auto">
          Access proprietary automated trading nodes with real-time profit tracking. Since 2016, Trustra Capital has delivered precision-grade capital management.
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-3 bg-primary text-white rounded-4xl hover:bg-primary-dark transition"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 bg-surface hover:bg-surface-hover text-primary rounded-4xl border border-primary transition"
          >
            Explore Platform
          </button>
        </div>
      </section>

      {/* Live BTC Price */}
      <section className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Live BTC Price (EUR)</h3>
        <p className="text-2xl font-mono text-primary">
          {btcPrice ? `€${btcPrice.toLocaleString()}` : "SYNCING..."}
        </p>
      </section>

      {/* Identity Verification */}
      <section className="bg-surface p-6 rounded-2xl text-center space-y-4 shadow-glass">
        <h3 className="font-bold text-white">Identity Verification Node</h3>
        <p className="text-text-muted">
          Regulatory-grade KYC verification required for withdrawals and higher tiers.
        </p>
        <button
          onClick={() => navigate("/kyc")}
          className="px-6 py-2 bg-primary text-white rounded-3xl hover:bg-primary-dark transition"
        >
          Upload Docs
        </button>
      </section>

      {/* Yield Protocol Nodes */}
      <section className="space-y-6">
        <h3 className="text-2xl font-bold text-white text-center">Yield Protocol Nodes</h3>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            { name: "Rio Starter", min: 100, max: 999, rate: "6–9%", pool: 88 },
            { name: "Rio Basic", min: 1000, max: 4999, rate: "9–12%", pool: 72 },
            { name: "Rio Standard", min: 5000, max: 14999, rate: "12–16%", pool: 94 },
            { name: "Rio Advanced", min: 15000, max: 49999, rate: "16–20%", pool: 65 },
            { name: "Rio Elite", min: 50000, max: "∞", rate: "20–25%", pool: 40 },
          ].map((node) => (
            <div
              key={node.name}
              className="bg-surface p-4 rounded-2xl text-center shadow-glass"
            >
              <h4 className="font-bold text-white">{node.name}</h4>
              <p className="text-text-muted">
                €{node.min.toLocaleString()} – {node.max.toLocaleString()}
              </p>
              <p className="text-success font-bold">{node.rate} Monthly</p>
              <p className="text-text-subtle">Pool {node.pool}%</p>
              <button
                onClick={() => navigate("/invest")}
                className="mt-2 px-4 py-1 bg-primary text-white rounded-3xl hover:bg-primary-dark transition"
              >
                Join Node
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Global Client Reviews */}
      <section className="space-y-6">
        <h3 className="text-2xl font-bold text-white text-center">Global Client Reviews</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Andreas Müller", country: "Germany", review: "The platform is transparent and technically solid. Daily tracking and withdrawals work exactly as described." },
            { name: "Sophie Laurent", country: "France", review: "I appreciate the structured risk management. Everything feels professional and well audited." },
            { name: "Marco Bianchi", country: "Italy", review: "Trustra Capital offers consistent performance. Support responds quickly and clearly." },
            { name: "Lucas van Dijk", country: "Netherlands", review: "Clean interface, reliable execution, and strong security standards. I feel confident deploying capital here." },
            { name: "Carlos Fernández", country: "Spain", review: "The automated strategy is efficient and stable. Excellent experience so far." },
          ].map((r) => (
            <div
              key={r.name}
              className="bg-surface p-4 rounded-2xl shadow-glass text-center"
            >
              <p className="text-text-muted italic">"{r.review}"</p>
              <p className="mt-2 font-bold text-white">{r.name}</p>
              <p className="text-text-subtle">{r.country}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="text-text-muted text-sm text-center">
        <p>
          Automated Strategy Disclaimer: Digital asset management involves market volatility. Trustra Capital deploys automated strategies with strict risk parameters. Past performance does not guarantee future results.
        </p>
      </section>

      {/* Headquarters & Support */}
      <section className="bg-surface p-6 rounded-2xl shadow-glass space-y-2 text-center">
        <h3 className="font-bold text-white">Headquarters</h3>
        <p>United States of America – Corporate Operations Center</p>
        <p>Email: <a href="mailto:infocare@gmail.com" className="text-primary">www.infocare@gmail.com</a></p>
        <p>Phone: +1 (878) 224-1625</p>

        <h4 className="font-bold mt-4 text-white">European Branches</h4>
        <p>United Kingdom • Germany • France • Netherlands • Italy • Spain</p>
      </section>

      <footer className="text-center text-text-muted mt-8">
        Trustra Capital Trade • 2016-2026 Audit Certified
      </footer>
    </div>
  );
}
