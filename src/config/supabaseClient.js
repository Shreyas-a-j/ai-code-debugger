import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Supabase URL is not defined in environment variables');
}

if (!supabaseAnonKey) {
  throw new Error('Supabase Anon Key is not defined in environment variables');
}

try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test the connection
supabase.auth.getSession()
  .then(response => {
    console.log('Supabase connection successful');
  })
  .catch(error => {
    console.error('Supabase connection error:', error);
  }); 