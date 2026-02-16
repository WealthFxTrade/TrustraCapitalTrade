#!/bin/bash
# Trustra Capital Local Launch Script
# ================================

# 1️⃣ Start Backend
echo "🚀 Starting backend on port 10000..."
gnome-terminal -- bash -c "cd backend && node server.js; exec bash" &

# 2️⃣ Wait a few seconds for backend to initialize
sleep 5

# 3️⃣ Serve Production Frontend
echo "🌐 Serving frontend on port 5000..."
gnome-terminal -- bash -c "cd frontend && serve -s dist -l 5000; exec bash" &

# 4️⃣ Wait for frontend to start
sleep 2

# 5️⃣ Open Browser
echo "🔗 Opening browser at http://localhost:5000"
xdg-open http://localhost:5000

echo "✅ All services started!"
