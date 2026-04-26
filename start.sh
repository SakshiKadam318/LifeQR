#!/bin/bash
echo "❤️‍🔥 Starting LifeQR..."
echo ""

# Setup backend env if missing
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "✅ Created backend/.env from example"
fi

# Install deps if missing
if [ ! -d backend/node_modules ]; then
  echo "📦 Installing backend dependencies..."
  cd backend && npm install && cd ..
fi

if [ ! -d frontend/node_modules ]; then
  echo "📦 Installing frontend dependencies..."
  cd frontend && npm install && cd ..
fi

echo ""
echo "🚀 Starting backend on http://localhost:5000"
echo "🌐 Starting frontend on http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

# Start both
(cd backend && npm run dev) &
(cd frontend && npm start) &

wait
