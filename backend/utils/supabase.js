require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Check if environment variables are set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
  console.error('   SUPABASE_KEY:', process.env.SUPABASE_KEY ? '✓ Set' : '✗ Missing');
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
)

module.exports = supabase
