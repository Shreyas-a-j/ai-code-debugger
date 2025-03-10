import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  try {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL?.trim();
    const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim();

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Construct full URL
    const fullUrl = supabaseUrl.includes('https://') 
      ? supabaseUrl 
      : `https://${supabaseUrl}`;

    return createClient(fullUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    });
  } catch (error) {
    console.error('Supabase client creation error:', error);
    // Return a mock client for development
    return {
      auth: {
        signOut: async () => {},
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOAuth: async () => ({ error: new Error('Auth not configured') })
      }
    };
  }
};

export const supabase = getSupabaseClient();

// Test the connection
supabase.auth.getSession()
  .then(response => {
    console.log('Supabase connection successful');
  })
  .catch(error => {
    console.error('Supabase connection error:', error);
  }); 