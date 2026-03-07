// constants/api.js
export const API_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:10000/api'
  : 'https://trustra-capital-trade-backend.vercel.app/api'; 

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/auth', // MATCHES: router.post('/', registerUser) in authRoutes.js
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile', // MATCHES: router.get('/profile', protect, getUserProfile)
  },
  ADMIN: {
    USERS: '/admin/users',
    WITHDRAWALS: '/admin/withdrawals',
    UPDATE_BALANCE: '/admin/user', // Usage: /admin/user/:id/balance
    APPROVE_WITHDRAWAL: '/admin/withdrawal', // Usage: /admin/withdrawal/:id
  }
};
