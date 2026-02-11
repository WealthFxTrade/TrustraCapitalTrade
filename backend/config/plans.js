/**
 * 📊 Trustra Capital - Investment Plans
 * These match the "Rio" nodes in Landing.jsx
 * min/max in EUR, rate represents estimated monthly ROI range
 */

export const PLAN_DATA = {
  rioStarter: {
    name: "Rio Starter",
    min: 100,
    max: 999,
    monthlyROI: "6–9%",      // display only
    dailyROI: 0.02           // approximate 2% daily (example: can adjust)
  },
  rioBasic: {
    name: "Rio Basic",
    min: 1000,
    max: 4999,
    monthlyROI: "9–12%",
    dailyROI: 0.03
  },
  rioStandard: {
    name: "Rio Standard",
    min: 5000,
    max: 14999,
    monthlyROI: "12–16%",
    dailyROI: 0.04
  },
  rioAdvanced: {
    name: "Rio Advanced",
    min: 15000,
    max: 49999,
    monthlyROI: "16–20%",
    dailyROI: 0.05
  },
  rioElite: {
    name: "Rio Elite",
    min: 50000,
    max: Infinity,
    monthlyROI: "20–25%",
    dailyROI: 0.06
  }
};

/**
 * ✅ Helper to get plan by key
 */
export const getPlan = (planKey) => PLAN_DATA[planKey] || null;

export default PLAN_DATA;
