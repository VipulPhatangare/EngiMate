#!/bin/bash

# Pre-deployment Checklist Script
# Run this script before deploying to verify everything is ready

echo "🔍 EngiMate Pre-Deployment Checklist"
echo "====================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
passed=0
failed=0
warnings=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2 exists"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $2 missing"
        ((failed++))
        return 1
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2 exists"
        ((passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $2 missing"
        ((failed++))
        return 1
    fi
}

# Function to check command
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $2 installed"
        ((passed++))
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $2 not found (required on server)"
        ((warnings++))
        return 1
    fi
}

echo "📋 Checking Project Structure..."
check_dir "backend" "Backend directory"
check_dir "frontend" "Frontend directory"
check_file "ecosystem.config.js" "PM2 configuration"
check_file "nginx.conf" "Nginx configuration"
check_file "DEPLOYMENT.md" "Deployment guide"
check_file "deploy.sh" "Deployment script"
echo ""

echo "📋 Checking Backend Files..."
check_file "backend/package.json" "Backend package.json"
check_file "backend/server.js" "Backend server.js"
check_file "backend/.env.production" "Backend .env.production template"
check_dir "backend/routes" "Backend routes directory"
check_dir "backend/models" "Backend models directory"
check_dir "backend/middleware" "Backend middleware directory"
check_dir "backend/utils" "Backend utils directory"
echo ""

echo "📋 Checking Frontend Files..."
check_file "frontend/package.json" "Frontend package.json"
check_file "frontend/vite.config.js" "Vite configuration"
check_file "frontend/.env.production" "Frontend .env.production"
check_file "frontend/index.html" "Frontend index.html"
check_dir "frontend/src" "Frontend src directory"
echo ""

echo "📋 Checking Environment Files..."
if [ -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠${NC} backend/.env exists (should not be committed to git)"
    ((warnings++))
else
    echo -e "${GREEN}✓${NC} backend/.env not in repository (correct)"
    ((passed++))
fi

if [ -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠${NC} frontend/.env exists (should not be committed to git)"
    ((warnings++))
else
    echo -e "${GREEN}✓${NC} frontend/.env not in repository (correct)"
    ((passed++))
fi

check_file "backend/.gitignore" "Backend .gitignore"
echo ""

echo "📋 Checking Required Tools (for deployment server)..."
check_command "node" "Node.js"
check_command "npm" "npm"
check_command "git" "Git"
check_command "nginx" "Nginx"
check_command "pm2" "PM2"
echo ""

echo "📋 Checking Git Status..."
if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC} Git repository initialized"
    ((passed++))
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠${NC} You have uncommitted changes"
        ((warnings++))
        echo "  Consider committing before deployment"
    else
        echo -e "${GREEN}✓${NC} No uncommitted changes"
        ((passed++))
    fi
    
    # Check current branch
    branch=$(git branch --show-current)
    echo -e "${GREEN}✓${NC} Current branch: $branch"
    ((passed++))
else
    echo -e "${RED}✗${NC} Not a git repository"
    ((failed++))
fi
echo ""

echo "====================================="
echo "📊 Summary:"
echo -e "  ${GREEN}Passed:${NC} $passed"
echo -e "  ${YELLOW}Warnings:${NC} $warnings"
echo -e "  ${RED}Failed:${NC} $failed"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✓ Ready for deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Commit and push changes to GitHub"
    echo "2. SSH into your VPS server"
    echo "3. Follow the steps in DEPLOYMENT.md"
    exit 0
else
    echo -e "${RED}✗ Please fix the failed checks before deploying${NC}"
    exit 1
fi
