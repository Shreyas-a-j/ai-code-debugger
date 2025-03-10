import { createClient } from '@supabase/supabase-js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Initializing Supabase client...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key present:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format');
}

const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-my-custom-header': 'AI-Code-Debugger' }
  },
  db: {
    schema: 'public'
  }
};

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);

// Test connection with retry logic
const testConnection = async (retries = MAX_RETRIES) => {
  try {
    console.log('Testing Supabase connection...');
    
    // First, try a simple health check
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .limit(1);

    if (healthError) {
      console.error('Health check failed:', healthError);
      throw healthError;
    }

    console.log('Health check successful');
    return true;
  } catch (error) {
    console.error(`Supabase connection attempt failed (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, error);
    
    if (retries > 1) {
      console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return testConnection(retries - 1);
    }
    
    console.error('Failed to establish Supabase connection after all retries');
    return false;
  }
};

// Initialize connection test
testConnection().then(success => {
  if (!success) {
    console.error('Unable to establish initial connection to Supabase');
  }
});

export const checkSupabaseConnection = async () => {
  try {
    // First check if we're online
    if (!navigator.onLine) {
      console.log('No internet connection detected');
      return false;
    }

    // Try to fetch the Supabase URL to check if it's accessible
    try {
      const response = await fetch(supabaseUrl);
      if (!response.ok) {
        console.error('Supabase URL is not accessible');
        return false;
      }
    } catch (error) {
      console.error('Failed to reach Supabase URL:', error);
      return false;
    }

    // If we can reach the URL, try a database query
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      console.error('Database query failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Connection check failed:', error);
    return false;
  }
};

// Add connection status listener
window.addEventListener('online', () => {
  console.log('Internet connection restored, testing Supabase connection...');
  testConnection();
});

window.addEventListener('offline', () => {
  console.log('Internet connection lost');
});

// Export a function to manually test the connection
export const testSupabaseConnection = async () => {
  try {
    // Check if we're online first
    if (!navigator.onLine) {
      console.error('No internet connection');
      return false;
    }

    // Try to connect to Supabase
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.error('Failed to connect to Supabase');
      return false;
    }

    console.log('Successfully connected to Supabase');
    return true;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return false;
  }
}; 