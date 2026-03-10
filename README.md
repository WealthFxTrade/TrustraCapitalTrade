# Trustra Capital Trade

Institutional-grade algorithmic trading platform with automated Rio Node protocols.

## Live Demo
https://trustra-capital-trade.vercel.app

## Features
- Daily yield distribution (Rio Starter → Elite tiers)
- Real-time BTC/EUR price tracking
- Secure deposits (BTC, ETH – ERC-20)
- Portfolio dashboard with performance charts
- Referral system & support ticket center
- Admin panel for user management & withdrawals

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts + Framer Motion
- **Backend**: Node.js + Express + MongoDB + Mongoose + Socket.io + BullMQ
- **Deployment**: Vercel (frontend) + Render (backend)

## Setup (Local Development)

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
cp .env.example .env    # edit MONGO_URI, JWT_SECRET, etc.
npm run dev
