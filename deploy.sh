#!/bin/bash

# EngiMate Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting EngiMate Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/engimate"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Function to print colored output
print_message() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running from correct directory
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory not found at $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"

# Pull latest changes
print_message "Pulling latest changes from GitHub..."
git pull origin main || {
    print_error "Failed to pull changes"
    exit 1
}

# Backend Deployment
print_message "Deploying Backend..."
cd "$BACKEND_DIR"

print_message "Installing backend dependencies..."
npm install --production || {
    print_error "Failed to install backend dependencies"
    exit 1
}

print_message "Restarting backend service..."
pm2 restart engimate-backend || {
    print_warning "Failed to restart, trying to start..."
    pm2 start ../ecosystem.config.js
}

# Frontend Deployment
print_message "Deploying Frontend..."
cd "$FRONTEND_DIR"

print_message "Installing frontend dependencies..."
npm install || {
    print_error "Failed to install frontend dependencies"
    exit 1
}

print_message "Building frontend..."
npm run build || {
    print_error "Failed to build frontend"
    exit 1
}

# Reload Nginx
print_message "Reloading Nginx..."
sudo systemctl reload nginx || {
    print_warning "Failed to reload Nginx, trying restart..."
    sudo systemctl restart nginx
}

# Save PM2 configuration
pm2 save

# Show status
print_message "Deployment completed successfully!"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "🌐 Application should be accessible at: https://engimate.synthomind.cloud"
echo ""
echo "📝 View logs with: pm2 logs engimate-backend"
echo "🔍 Monitor with: pm2 monit"
