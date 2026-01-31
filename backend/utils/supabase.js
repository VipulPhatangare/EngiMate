require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Check if environment variables are set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
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
