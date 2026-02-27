// config/plans.js
// Safe, realistic, and educational investment plan configuration
// IMPORTANT: No fixed or guaranteed returns are ever promised.
// Real yield must come from verifiable external sources (staking, trading, etc.).
// All investments carry risk of total loss.

export const PLAN_DATA = {
  starter: {
    key: 'starter',
    name: 'Starter',
    min: 100,
    max: 999,
    description: 'Entry-level investment option for learning and small-scale participation.',
    durationDays: 30,
    features: [
      'Basic access to platform',
      'Educational resources',
      'Market updates',
    ],
    riskLevel: 'High',
    color: '#3b82f6', // Blue
  },

  basic: {
    key: 'basic',
    name: 'Basic',
    min: 1000,
    max: 4999,
    description: 'Balanced plan suitable for moderate risk tolerance.',
    durationDays: 45,
    features: [
      'Standard platform access',
      'Market insights',
      'Priority email support',
    ],
    riskLevel: 'High',
    color: '#10b981', // Green
  },

  standard: {
    key: 'standard',
    name: 'Standard',
    min: 5000,
    max: 14999,
    description: 'Standard tier for more active participation.',
    durationDays: 60,
    features: [
      'Advanced analytics',
      'Priority support',
      'Monthly performance reports',
    ],
    riskLevel: 'High',
    color: '#f59e0b', // Amber
  },

  advanced: {
    key: 'advanced',
    name: 'Advanced',
    min: 15000,
    max: 49999,
    description: 'Advanced plan for experienced participants.',
    durationDays: 90,
    features: [
      'Premium analytics & tools',
      'Personalized insights',
      'Dedicated support channel',
    ],
    riskLevel: 'High',
    color: '#8b5cf6', // Purple
  },

  elite: {
    key: 'elite',
    name: 'Elite',
    min: 50000,
    max: Infinity,
    description: 'High-tier plan for significant participation.',
    durationDays: 120,
    features: [
      'VIP access & tools',
      'Custom strategy sessions',
      'Exclusive market briefings',
    ],
    riskLevel: 'High',
    color: '#ef4444', // Red
  },
};

/**
 * Get plan configuration by key (case-insensitive)
 * @param {string} key - e.g. 'starter', 'basic'
 * @returns {Object|null} Plan config or null
 */
export function getPlan(key) {
  if (!key) return null;
  return PLAN_DATA[key.toLowerCase()] || null;
}

/**
 * Find the most appropriate plan based on investment amount
 * @param {number} amount - Investment amount in EUR
 * @returns {string} Plan key ('starter', 'basic', etc.) or 'none'
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

/**
 * IMPORTANT LEGAL & RISK DISCLOSURE
 * Must be displayed prominently wherever plans are shown
 */
export const RISK_DISCLOSURE = `
  Cryptocurrency and digital asset investments carry significant risk of loss.
  No returns are guaranteed. Past performance is not indicative of future results.
  You may lose all invested capital. Only invest what you can afford to lose.
  This platform is for informational and educational purposes only.
  Always conduct your own research and consult qualified financial advisors.
`;

/**
 * Helper: Get all plan keys
 * @returns {string[]} Array of plan keys
 */
export function getAllPlanKeys() {
  return Object.keys(PLAN_DATA);
}
