#!/bin/bash

# Quick Start Script for Development
# This script sets up the development environment

echo "🚀 EngiMate Development Environment Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js $(node --version) detected"
echo "✓ npm $(npm --version) detected"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✓ Created .env file. Please update it with your credentials."
    else
        echo "❌ .env.example not found!"
        exit 1
    fi
fi

if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
else
    echo "✓ Backend dependencies already installed"
fi

echo ""
echo "📦 Setting up Frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
else
    echo "✓ Frontend dependencies already installed"
fi

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "To start development:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Backend will run on: http://localhost:5050"
echo "Frontend will run on: http://localhost:5173"
echo ""
