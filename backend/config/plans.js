// backend/config/plans.js - Audit Synchronized v8.4.1
// Safe, realistic, and educational investment plan configuration

export const PLAN_DATA = {
  starter: {
    key: 'starter',
    name: 'Rio Starter',
    min: 100,
    max: 999,
    dailyROI: 0.0025, // ~7.5% Monthly Target (within 6-9% range)
    durationDays: 30,
    riskLevel: 'High',
    color: '#3b82f6',
  },
  basic: {
    key: 'basic',
    name: 'Rio Basic',
    min: 1000,
    max: 4999,
    dailyROI: 0.0035, // ~10.5% Monthly Target (within 9-12% range)
    durationDays: 45,
    riskLevel: 'High',
    color: '#10b981',
  },
  standard: {
    key: 'standard',
    name: 'Rio Standard',
    min: 5000,
    max: 14999,
    dailyROI: 0.0046, // ~14% Monthly Target (within 12-16% range)
    durationDays: 60,
    riskLevel: 'High',
    color: '#f59e0b',
  },
  advanced: {
    key: 'advanced',
    name: 'Rio Advanced',
    min: 15000,
    max: 49999,
    dailyROI: 0.006, // ~18% Monthly Target (within 16-20% range)
    durationDays: 90,
    riskLevel: 'High',
    color: '#8b5cf6',
  },
  elite: {
    key: 'elite',
    name: 'Rio Elite',
    min: 50000,
    max: Infinity,
    dailyROI: 0.0075, // ~22.5% Monthly Target (within 20-25% range)
    durationDays: 120,
    riskLevel: 'High',
    color: '#ef4444',
  },
};

/**
 * Get plan configuration by key (case-insensitive)
 */
export function getPlan(key) {
  if (!key) return null;
  const normalizedKey = key.toLowerCase().replace('rio ', '');
  return PLAN_DATA[normalizedKey] || null;
}

/**
 * Find the most appropriate plan based on investment amount
 */
export function findPlanByAmount(amount) {
  if (typeof amount !== 'number' || amount < 0) return 'none';

  for (const [key, plan] of Object.entries(PLAN_DATA)) {
    if (amount >= plan.min && (plan.max === Infinity || amount <= plan.max)) {
      return key;
    }
  }
  return 'none';
}

export const RISK_DISCLOSURE = `
  Cryptocurrency and digital asset investments carry significant risk of loss.
  No returns are guaranteed. Past performance is not indicative of future results.
  Audit Certified Protocol v8.4.1 active for current node cycle.
`;

export default PLAN_DATA;

