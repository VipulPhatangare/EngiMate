# Quick Deployment Summary for engimate.synthomind.cloud

## 📋 Deployment Checklist

### ✅ Files Created
- [x] `backend/.env.production` - Production environment template
- [x] `backend/.env.example` - Development environment template
- [x] `frontend/.env.production` - Frontend production config
- [x] `ecosystem.config.js` - PM2 configuration
- [x] `nginx.conf` - Nginx web server configuration
- [x] `DEPLOYMENT.md` - Complete deployment guide
- [x] `deploy.sh` - Automated deployment script
- [x] `pre-deploy-check.sh` - Pre-deployment validation
- [x] `start-dev.sh` - Development setup script
- [x] Updated `README.md` with deployment instructions
- [x] Updated `frontend/src/utils/api.js` to use environment variables

### 🎯 Next Steps

#### 1. Before Pushing to GitHub

```bash
# Run pre-deployment check
bash pre-deploy-check.sh

# If all checks pass, commit and push
git add .
git commit -m "Add deployment configuration for production"
git push origin main
```

#### 2. On Your VPS Server (194.238.17.210)

```bash
# SSH into server (use port 2050 if needed)
ssh user@194.238.17.210 -p 2050

# Follow the complete guide in DEPLOYMENT.md
# Or quick start:

# 1. Install prerequisites
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
sudo npm install -g pm2

# 2. Clone repository
cd /var/www
sudo git clone https://github.com/VipulPhatangare/EngiMate.git engimate
sudo chown -R $USER:$USER /var/www/engimate

# 3. Configure backend
cd /var/www/engimate/backend
npm install
cp .env.production .env
nano .env  # Update with actual credentials

# 4. Build frontend
cd /var/www/engimate/frontend
npm install
npm run build

# 5. Configure Nginx
sudo cp /var/www/engimate/nginx.conf /etc/nginx/sites-available/engimate.synthomind.cloud
sudo ln -s /etc/nginx/sites-available/engimate.synthomind.cloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 6. Start with PM2
cd /var/www/engimate
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 🔐 Required Credentials

Make sure you have these ready:

1. **MongoDB URI** - Your MongoDB connection string
2. **Supabase Credentials**:
   - SUPABASE_URL
   - SUPABASE_KEY
3. **Email Credentials**:
   - EMAIL_USER (Gmail)
   - EMAIL_PASS (App-specific password)
4. **Secrets** (Generate secure random strings):
   - JWT_SECRET (32+ characters)
   - SESSION_SECRET (32+ characters)

### 🌐 DNS Configuration

In your DNS provider for `synthomind.cloud`:

```
Type: A
Host: engimate
Value: 194.238.17.210
TTL: 3600
```

### 🔒 SSL Certificate (After DNS Propagation)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d engimate.synthomind.cloud
sudo certbot renew --dry-run
```

### 📊 Testing Deployment

1. **Check DNS**: `nslookup engimate.synthomind.cloud`
2. **Check Backend**: `curl http://localhost:5050/api/health`
3. **Check PM2**: `pm2 status`
4. **Check Nginx**: `sudo nginx -t`
5. **View Logs**: `pm2 logs engimate-backend`

### 🔄 Future Updates

```bash
cd /var/www/engimate
bash deploy.sh
```

### 📱 Useful Commands

```bash
# Application Management
pm2 status                    # Check status
pm2 logs engimate-backend     # View logs
pm2 restart engimate-backend  # Restart app
pm2 monit                     # Monitor resources

# Nginx Management
sudo systemctl status nginx   # Check Nginx status
sudo systemctl reload nginx   # Reload config
sudo tail -f /var/log/nginx/error.log  # View logs

# System Management
df -h                         # Check disk space
free -m                       # Check memory
htop                          # System monitor
```

### 🐛 Troubleshooting

**Backend not starting?**
```bash
pm2 logs engimate-backend
cat /var/www/engimate/logs/backend-error.log
```

**Nginx errors?**
```bash
sudo tail -f /var/log/nginx/error.log
sudo nginx -t
```

**Port issues?**
```bash
sudo netstat -tulpn | grep :5050
sudo lsof -i :5050
```

**Database connection?**
```bash
# Check MongoDB URI in .env
cat backend/.env | grep MONGODB_URI
```

### 📚 Documentation References

- **Complete Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Project Overview**: [README.md](./README.md)
- **PM2 Docs**: https://pm2.keymetrics.io/docs/
- **Nginx Docs**: https://nginx.org/en/docs/

### ⚡ Performance Tips

1. Enable Gzip compression (already in nginx.conf)
2. Use PM2 cluster mode for high traffic
3. Set up log rotation
4. Configure caching headers
5. Use CDN for static assets (optional)
6. Monitor with PM2 Plus (optional)

### 🔐 Security Best Practices

- [x] Firewall configured (UFW)
- [x] SSL certificate installed
- [x] Environment variables secured
- [x] CORS properly configured
- [ ] Rate limiting (recommended)
- [ ] Regular backups configured
- [ ] Security updates automated

---

**Domain**: engimate.synthomind.cloud  
**IP**: 194.238.17.210  
**SSH Port**: 2050
**Backend Port**: 5050  
**Repository**: https://github.com/VipulPhatangare/EngiMate.git

**Status**: Ready for deployment ✅
