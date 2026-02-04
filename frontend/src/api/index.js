/**
 * TRUSTRA CAPITAL TRADE - API LAYER ENTRY POINT
 * Finalized for 2026 Production Environment
 */

// 1. Core Engine (Axios Instance with Interceptors)
export { default as api } from './apiService'; 

// 2. Authentication (Login, Register, Password Reset)
export * from './auth';            

// 3. Financials (Deposits, Withdrawals, History)
export * from './transactions';    

// 4. Investor Data (Profile, Balances, KYC)
export * from './user';            

// 5. Management (Admin Queue, User Audit)
export * from './admin';           

