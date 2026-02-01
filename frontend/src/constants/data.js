/* src/constants/data.js */

// --- PRODUCTION INVESTMENT DATA ---
export const ROI_PLANS = [
  { id: 1, name: "Starter Tier", roi: 5, min: 500, days: 7 },
  { id: 2, name: "Growth Tier", roi: 12, min: 5000, days: 14 },
  { id: 3, name: "Professional", roi: 25, min: 20000, days: 30 },
  { id: 4, name: "Institutional", roi: 35, min: 50000, days: 60 },
  { id: 5, name: "Vanguard Elite", roi: 50, min: 100000, days: 90 }
];

// --- PRODUCTION FOREIGN REVIEWS ---
export const REVIEWS = [
  { id: 1, name: "Diego Lopez", country: "Spain", text: "Trusted since 2016. The high-yield strategies are unmatched." },
  { id: 2, name: "Jennifer Gonzalez", country: "USA", text: "Verified withdrawals and excellent security protocols." },
  { id: 3, name: "Myron Lyons", country: "Canada", text: "Professional dashboard. The best risk-managed crypto platform." },
  { id: 4, name: "Maria Linn", country: "Germany", text: "Execution speed and support quality are top-tier." },
  { id: 5, name: "Satya Sharma", country: "India", text: "Transparent institutional plans. Very satisfied with my ROI." }
];

// --- APP DATA ---
export const USERS = [
  { id: 1, name: "Alice Smith", email: "alice.smith@example.com", registrationDate: "2023-10-27", role: "user" },
  { id: 2, name: "Bob Johnson", email: "bob.johnson@example.com", registrationDate: "2023-11-15", role: "user" },
  { id: 3, name: "Admin", email: "admin@trustra.com", registrationDate: "2024-01-01", role: "admin" }
];

export const PRODUCTS = [
  { id: 101, name: "Hardware Wallet", category: "Security", price: 149.99, inStock: true },
  { id: 102, name: "Trading Terminal", category: "Software", price: 250.50, inStock: true },
  { id: 103, name: "Crypto Guide", category: "Education", price: 19.99, inStock: true }
];

