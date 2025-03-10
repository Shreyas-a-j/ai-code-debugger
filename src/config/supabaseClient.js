import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Initializing Supabase client');
console.log('URL configured:', !!supabaseUrl);
console.log('Key configured:', !!supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection immediately
const testConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Connection Error Details:', {
        message: error.message,
        status: error.status,
        name: error.name,
        details: error.details
      });
    } else {
      console.log('Connection successful:', {
        hasSession: !!data.session
      });
    }
  } catch (err) {
    console.error('Unexpected Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
  }
};

testConnection();

export { supabase }; 