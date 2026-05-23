// src/utils/investmentCalculator.js

/**
 * Calculate Investment Returns using backend logic
 */
export const calculateProfit = ({
  amount = 0,
  plan = 'Tier III: Prime',
  durationMonths = 12,
  compounding = 'daily'
}) => {
  if (amount <= 0) {
    return { error: 'Investment amount must be greater than zero' };
  }

  // Match backend rates
  const ROI_ANNUAL_RATES = {
    'Tier I: Entry': 6,
    'Tier II: Core': 10.5,
    'Tier III: Prime': 13.5,
    'Tier IV: Institutional': 18,
    'Tier V: Sovereign': 24,
  };

  const annualRate = ROI_ANNUAL_RATES[plan] || 13.5;
  const rate = annualRate / 100;

  let finalAmount = amount;
  let totalProfit = 0;
  let monthlyProfit = 0;

  if (compounding === 'daily') {
    const dailyRate = rate / 365;
    finalAmount = amount * Math.pow(1 + dailyRate, durationMonths * 30.4167); // average month length
  } else if (compounding === 'monthly') {
    const monthlyRate = rate / 12;
    finalAmount = amount * Math.pow(1 + monthlyRate, durationMonths);
  } else {
    // yearly
    finalAmount = amount * Math.pow(1 + rate, durationMonths / 12);
  }

  totalProfit = finalAmount - amount;
  monthlyProfit = totalProfit / durationMonths;

  return {
    initialInvestment: Number(amount.toFixed(2)),
    finalAmount: Number(finalAmount.toFixed(2)),
    totalProfit: Number(totalProfit.toFixed(2)),
    monthlyProfit: Number(monthlyProfit.toFixed(2)),
    annualRate,
    plan,
    durationMonths,
    effectiveAPY: annualRate,
    compounding
  };
};

/** Simple version for quick display */
export const calculateSimpleROI = (amount, plan, years = 1) => {
  const result = calculateProfit({ 
    amount, 
    plan, 
    durationMonths: years * 12,
    compounding: 'daily' 
  });

  return {
    monthly: result.monthlyProfit,
    yearly: result.totalProfit / years,
    total: result.totalProfit,
    finalAmount: result.finalAmount,
    plan
  };
};
