import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null
});

const LoadingSpinner = () => (
  <div style={{ 
    padding: '20px', 
    textAlign: 'center',
    color: '#666'
  }}>
    Loading...
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div style={{ 
    padding: '20px', 
    textAlign: 'center', 
    color: 'red',
    background: '#fee2e2',
    borderRadius: '8px',
    margin: '20px'
  }}>
    Error: {message}
  </div>
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AuthProvider mounted');

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          return;
        }

        console.log('Session check:', session ? 'Active session' : 'No session');
        setUser(session?.user ?? null);
        
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setUser(session?.user ?? null);
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  console.log('AuthProvider rendering:', { loading, hasUser: !!user, hasError: !!error });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  const value = {
    user,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 