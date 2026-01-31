# Engimate - MHT CET Engineering Counselling Platform

A complete web application for MHT CET engineering counselling with separate frontend and backend, featuring user authentication, email verification, and responsive design.

## Color Scheme
- **Off-White**: #F8F9FA
- **Charcoal**: #2C3E50
- **Charcoal Light**: #4A6278
- **Charcoal Lighter**: #7B8FA3

## Features

### Frontend
- ✨ Modern responsive landing page
- 📱 Mobile-first design with sliding sidebar navigation
- 🔐 Sign Up and Sign In modals
- 📧 Email verification with OTP
- 🎨 Clean and professional UI
- 💾 JWT token-based authentication
- 🔄 Persistent login state

### Backend
- 🗄️ MongoDB database integration
- 🔒 Secure password hashing with bcryptjs
- 🎫 JWT authentication
- 📨 Email verification using Nodemailer
- ⏱️ OTP expiration (10 minutes)
- 🛡️ Protected routes with middleware

## Project Structure

```
Engimate react/
├── frontend/                 # Vite + React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── SignIn.jsx   # Sign in modal
│   │   │   ├── SignUp.jsx   # Sign up modal with OTP
│   │   │   └── Auth.css     # Authentication styles
│   │   ├── App.jsx          # Main app with navbar & sidebar
│   │   ├── App.css          # Main styles with responsive design
│   │   └── index.css        # Global styles
│   └── package.json
├── backend/                  # Express.js backend
│   ├── models/
│   │   └── User.js          # User model
│   ├── routes/
│   │   └── auth.js          # Authentication routes
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── utils/
│   │   └── emailService.js  # Nodemailer email service
│   ├── server.js            # Main server file
│   ├── .env                 # Environment variables
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Gmail account for sending emails

### Environment Variables

The backend `.env` file is already configured with:
```env
PORT=5050
MONGODB_URI=mongodb+srv://synthomind:kEB5OOanYGOlyL9L@cluster.4kercf5.mongodb.net/Engimate?retryWrites=true&w=majority&appName=Cluster
SESSION_SECRET=Engimate
JWT_SECRET=Engimate_JWT_Secret_Key_2025
EMAIL_USER=vipulphatangare3@gmail.com
EMAIL_PASS=kumx umkj gkzg cuuf
```

### Installation & Setup

1. **Backend Setup**
```bash
cd backend
npm install
npm start
```
The backend will run on `http://localhost:5050`

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`

## Authentication Flow

### Sign Up Process
1. User fills in registration form (name, surname, email, phone, password)
2. Backend validates data and generates 6-digit OTP
3. OTP is sent to user's email via Nodemailer
4. User enters OTP within 10 minutes
5. Upon successful verification, JWT token is generated
6. User is automatically logged in

### Sign In Process
1. User enters email and password
2. Backend validates credentials
3. JWT token is generated and sent to frontend
4. Token is stored in localStorage
5. User stays logged in across sessions

### Mobile Navigation
- Hamburger menu appears on screens < 768px
- Sidebar slides in from left with smooth animation
- Click overlay to close sidebar
- All navigation links work in mobile view

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/register`
Register new user and send OTP
```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john@example.com",
  "phoneNumber": "1234567890",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### POST `/verify-otp`
Verify OTP and complete registration
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### POST `/login`
User login
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/me`
Get current user (requires JWT token)
```
Headers: Authorization: Bearer <token>
```

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Custom styling with CSS variables
- **Fetch API** - HTTP requests

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Nodemailer** - Email service
- **dotenv** - Environment variables
- **CORS** - Cross-origin resource sharing

## Responsive Design

### Desktop (> 768px)
- Full navigation bar with links
- Multi-column feature cards
- Large hero section

### Mobile (< 768px)
- Hamburger menu
- Sliding sidebar navigation
- Single-column layout
- Touch-friendly buttons
- Optimized typography

## Security Features

- 🔐 Password hashing with bcryptjs (10 salt rounds)
- 🎫 JWT tokens with 7-day expiration
- 📧 Email verification required before login
- ⏱️ OTP expires after 10 minutes
- 🛡️ Protected API routes
- 🔒 Secure HTTP-only approach ready

## Color Variables (CSS)

```css
--off-white: #F8F9FA
--charcoal: #2C3E50
--charcoal-dark: #1A252F
--charcoal-light: #4A6278
--charcoal-lighter: #7B8FA3
--text-light: #95A5A6
```

## Future Enhancements

- Password reset functionality
- Social login (Google, Facebook)
- User profile management
- College predictor tool
- Cut-off analysis dashboard
- Document upload system
- Admin panel
- Real-time notifications

## 🌐 Production Deployment

### Live URL
**https://engimate.synthomind.cloud**

### Deployment Information

- **Server**: Hostinger VPS
- **IP Address**: 194.238.17.210
- **Port**: 2050
- **Process Manager**: PM2
- **Web Server**: Nginx
- **Repository**: https://github.com/VipulPhatangare/EngiMate.git

### Deployment Files

This project includes comprehensive deployment configurations:

- `ecosystem.config.js` - PM2 process manager configuration
- `nginx.conf` - Nginx web server configuration
- `DEPLOYMENT.md` - Complete deployment guide with step-by-step instructions
- `deploy.sh` - Automated deployment script
- `pre-deploy-check.sh` - Pre-deployment validation script
- `.env.production` - Production environment templates (backend & frontend)

### Quick Deployment

1. **Run Pre-deployment Check**
   ```bash
   bash pre-deploy-check.sh
   ```

2. **Commit and Push Changes**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

3. **On VPS Server**
   ```bash
   # Clone or pull latest changes
   cd /var/www/engimate
   git pull origin main
   
   # Run deployment script
   bash deploy.sh
   ```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Environment Configuration

#### Backend Production (.env)
```env
PORT=5050
NODE_ENV=production
MONGODB_URI=your_mongodb_uri
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://engimate.synthomind.cloud
```

#### Frontend Production (.env.production)
```env
VITE_API_URL=https://engimate.synthomind.cloud/api
```

### Monitoring

```bash
# Check application status
pm2 status

# View logs
pm2 logs engimate-backend

# Monitor resources
pm2 monit
```

## License

All rights reserved © 2025-2026 Engimate
