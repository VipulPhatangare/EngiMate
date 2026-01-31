const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const supabase = require('./utils/supabase');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {})
  .catch((err) => {});

// Supabase Connection Test
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('colleges')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      // Supabase Connection Error
    } else {
      // Supabase Connected Successfully
    }
  } catch (err) {
    // Supabase Connection Error
  }
}

testSupabaseConnection();

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


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});
