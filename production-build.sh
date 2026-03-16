#!/bin/bash

echo "🚀 [TRUSTRA] Initiating Production Build Sequence..."

# 1. Frontend Build
echo "📦 Compiling Frontend Assets..."                                                  
cd frontend                                                                             
npm install
npm run build
cd ..

# 2. Preparation of Backend static folder
echo "📂 Synchronizing Static Assets..."
rm -rf backend/dist
mkdir -p backend/dist
cp -r frontend/dist/* backend/dist/

# 3. Backend Dependency Check
echo "📡 Auditing Backend Dependencies..."
cd backend
npm install --production
cd ..

echo "✅ [SUCCESS] Build Complete. Ready for Zurich Mainnet Deployment."
echo "💡 To start the server: cd backend && npm start"
