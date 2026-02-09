const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const supabase = require('./utils/supabase');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with proper error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// MongoDB connection event listeners
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Engimate API Server Running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy' });
});

// Auth Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// College Routes (Supabase)
const collegeRoutes = require('./routes/colleges');
app.use('/api/colleges', collegeRoutes);


const topCollegeRoutes = require('./routes/topColleges');
app.use('/api/topColleges', topCollegeRoutes);

const preferenceListRoutes = require('./routes/preferenceList');
app.use('/api/preferenceList', preferenceListRoutes);

const collegePredictorRoutes = require('./routes/collegePredictor');
app.use('/api/collegePredictor', collegePredictorRoutes);

// Notification Routes
const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);


// Start server
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 MongoDB Status: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Connecting... ⏳'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
