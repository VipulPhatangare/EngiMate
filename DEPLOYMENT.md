# EngiMate Deployment Guide

## Server Details
- **Domain:** engimate.synthomind.cloud
- **IP Address:** 194.238.17.210
- **Port:** 2050
- **Repository:** https://github.com/VipulPhatangare/EngiMate.git

## Prerequisites on VPS

### 1. Install Node.js and npm
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2

# Setup PM2 to start on system boot
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### 3. Install Nginx
```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. Install Git
```bash
sudo apt install -y git
```

## Deployment Steps

### Step 1: Clone Repository
```bash
# Navigate to web directory
cd /var/www

# Clone the repository
sudo git clone https://github.com/VipulPhatangare/EngiMate.git engimate

# Set ownership
sudo chown -R $USER:$USER /var/www/engimate

# Navigate to project
cd /var/www/engimate
```

### Step 2: Configure Backend

```bash
# Navigate to backend
cd /var/www/engimate/backend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.production .env

# Edit .env with actual values
nano .env
```

**Important:** Update these values in `.env`:
- `MONGODB_URI` - Your MongoDB connection string
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon key
- `JWT_SECRET` - Generate a strong secret (32+ characters)
- `EMAIL_USER` and `EMAIL_PASS` - Your email credentials
- `SESSION_SECRET` - Generate a strong secret (32+ characters)

### Step 3: Build Frontend

```bash
# Navigate to frontend
cd /var/www/engimate/frontend

# Install dependencies
npm install

# Build for production
npm run build
```

The build output will be in `frontend/dist` directory.

### Step 4: Configure Nginx

```bash
# Copy nginx configuration
sudo cp /var/www/engimate/nginx.conf /etc/nginx/sites-available/engimate.synthomind.cloud

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/engimate.synthomind.cloud /etc/nginx/sites-enabled/

# Remove default configuration (if exists)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 5: Start Backend with PM2

```bash
# Navigate to project root
cd /var/www/engimate

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
pm2 status

# View logs
pm2 logs engimate-backend
```

### Step 6: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 2050/tcp

# Allow SSH (if not already allowed)
sudo ufw allow 2050/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 7: DNS Configuration

In your domain DNS settings (for engimate.synthomind.cloud):

```
Type: A
Name: engimate
Value: 194.238.17.210
TTL: 3600
```

### Step 8: SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d engimate.synthomind.cloud

# Certbot will automatically configure Nginx for HTTPS
# Choose option 2 to redirect HTTP to HTTPS

# Test auto-renewal
sudo certbot renew --dry-run
```

## Useful PM2 Commands

```bash
# View logs
pm2 logs engimate-backend

# Restart application
pm2 restart engimate-backend

# Stop application
pm2 stop engimate-backend

# Delete from PM2
pm2 delete engimate-backend

# Monitor application
pm2 monit

# View application info
pm2 info engimate-backend
```

## Update/Redeploy Application

```bash
# Navigate to project
cd /var/www/engimate

# Pull latest changes
git pull origin main

# Update backend
cd backend
npm install
pm2 restart engimate-backend

# Update frontend
cd ../frontend
npm install
npm run build

# Reload Nginx
sudo systemctl reload nginx
```

## Troubleshooting

### Check Backend Logs
```bash
pm2 logs engimate-backend
# or
cat /var/www/engimate/logs/backend-error.log
```

### Check Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Test Backend API
```bash
curl http://localhost:5000/api/health
```

### Check if Backend is Running
```bash
pm2 status
sudo netstat -tulpn | grep :5000
```

### Restart Services
```bash
# Restart backend
pm2 restart engimate-backend

# Restart Nginx
sudo systemctl restart nginx
```

## Environment Variables Reference

### Backend (.env)
- `PORT` - Backend server port (default: 5000)
- `NODE_ENV` - Environment (production)
- `MONGODB_URI` - MongoDB connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anonymous key
- `JWT_SECRET` - JWT signing secret
- `EMAIL_HOST` - SMTP host
- `EMAIL_PORT` - SMTP port
- `EMAIL_USER` - Email account
- `EMAIL_PASS` - Email password
- `CORS_ORIGIN` - Allowed frontend URL
- `SESSION_SECRET` - Session signing secret

### Frontend (built with .env.production)
- `VITE_API_URL` - Backend API URL
- `VITE_N8N_WEBHOOK_URL` - N8N webhook URL (if applicable)

## Security Checklist

- [ ] Strong passwords for MongoDB and email
- [ ] JWT_SECRET and SESSION_SECRET are random and strong (32+ characters)
- [ ] Firewall is enabled and configured
- [ ] SSL certificate is installed
- [ ] .env files are not committed to git
- [ ] Regular backups configured
- [ ] PM2 is set to restart on system reboot
- [ ] Nginx security headers configured

## Monitoring

### Setup Monitoring Alerts
```bash
# Monitor with PM2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Backup Strategy

### Database Backup
```bash
# MongoDB backup script
mongodump --uri="your_mongodb_uri" --out=/backups/mongodb/$(date +%Y%m%d)
```

### Application Backup
```bash
# Create backup
cd /var/www
sudo tar -czf engimate-backup-$(date +%Y%m%d).tar.gz engimate/

# Store backups in safe location
```

## Support

For issues or questions:
- Check logs first: `pm2 logs engimate-backend`
- Verify Nginx configuration: `sudo nginx -t`
- Check system resources: `htop` or `top`
- Review this documentation

## Post-Deployment Verification

1. Visit https://engimate.synthomind.cloud
2. Test user registration and login
3. Check all features are working
4. Monitor logs for errors: `pm2 logs`
5. Verify SSL certificate is valid
6. Test API endpoints

---

**Last Updated:** January 2026
**Version:** 1.0.0
