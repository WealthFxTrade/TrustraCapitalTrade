/* src/constants/data.js */

// --- PRODUCTION INVESTMENT DATA (Rio Series 2026) ---
export const ROI_PLANS = [
  { 
    id: 1, 
    name: "Rio Starter", // MUST match Backend PLAN_RATES
    roi: 9,              // 9% Monthly target
    min: 100, 
    days: 30,
    desc: "Entry-level automated trading for new investors."
  },
  { 
    id: 2, 
    name: "Rio Basic", 
    roi: 12, 
    min: 1000, 
    days: 45,
    desc: "Increased liquidity and higher priority execution."
  },
  { 
    id: 3, 
    name: "Rio Standard", 
    roi: 16, 
    min: 5000, 
    days: 60,
    desc: "Institutional grade risk management and steady yields."
  },
  { 
    id: 4, 
    name: "Rio Advanced", 
    roi: 20, 
    min: 15000, 
    days: 90,
    desc: "Advanced algorithmic strategies for professional portfolios."
  },
  { 
    id: 5, 
    name: "Rio Elite", 
    roi: 25, 
    min: 50000, 
    days: 120,
    desc: "Maximum yield with One World Trade Center advisory support."
  }
];

// --- PRODUCTION FOREIGN REVIEWS ---
export const REVIEWS = [
  { id: 1, name: "Diego Lopez", country: "Spain", text: "Trusted since 2016. The high-yield strategies are unmatched." },
  { id: 2, name: "Jennifer Gonzalez", country: "USA", text: "Verified withdrawals and excellent security protocols." },
  { id: 3, name: "Myron Lyons", country: "Canada", text: "Professional dashboard. The best risk-managed crypto platform." },
  { id: 4, name: "Maria Linn", country: "Germany", text: "Execution speed and support quality are top-tier." },
  { id: 5, name: "Satya Sharma", country: "India", text: "Transparent institutional plans. Very satisfied with my ROI." }
];

// --- APP DATA (Internal use for Admin testing) ---
export const USERS = [
  { id: 1, name: "Alice Smith", email: "alice.smith@example.com", registrationDate: "2023-10-27", role: "user" },
  { id: 2, name: "Bob Johnson", email: "bob.johnson@example.com", registrationDate: "2023-11-15", role: "user" },
  { id: 3, name: "Admin", email: "admin@trustra.com", registrationDate: "2024-01-01", role: "admin" }
];

