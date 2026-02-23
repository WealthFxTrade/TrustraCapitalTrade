/**
 * 📊 Trustra Capital - Investment Plans (Rio Series 2026)
 * These match the "Rio" nodes in Landing.jsx
 */

export const PLAN_DATA = {
  rioStarter: {
    name: "Rio Starter",
    min: 100,
    max: 999,
    monthlyROI: "6–9%",
    dailyROI: 0.002,     // 0.2% daily = ~6% monthly
    duration: 30,        // Days
    color: "#3b82f6"     // Blue
  },
  rioBasic: {
    name: "Rio Basic",
    min: 1000,
    max: 4999,
    monthlyROI: "9–12%",
    dailyROI: 0.0035,    // 0.35% daily = ~10.5% monthly
    duration: 30,
    color: "#10b981"     // Green
  },
  rioStandard: {
    name: "Rio Standard",
    min: 5000,
    max: 14999,
    monthlyROI: "12–16%",
    dailyROI: 0.005,     // 0.5% daily = ~15% monthly
    duration: 60,
    color: "#f59e0b"     // Amber
  },
  rioAdvanced: {
    name: "Rio Advanced",
    min: 15000,
    max: 49999,
    monthlyROI: "16–20%",
    dailyROI: 0.0065,    // 0.65% daily = ~19.5% monthly
    duration: 90,
    color: "#8b5cf6"     // Purple
  },
  rioElite: {
    name: "Rio Elite",
    min: 50000,
    max: Infinity,
    monthlyROI: "20–25%",
    dailyROI: 0.008,     // 0.8% daily = ~24% monthly
    duration: 120,
    color: "#ef4444"     // Red
  }
};

/**
 * ✅ Helpers
 */
export const getPlan = (planKey) => PLAN_DATA[planKey] || null;

// Returns the correct plan key based on an amount
export const findPlanByAmount = (amount) => {
  return Object.keys(PLAN_DATA).find(key => 
    amount >= PLAN_DATA[key].min && amount <= PLAN_DATA[key].max
  ) || 'none';
};

export default PLAN_DATA;
