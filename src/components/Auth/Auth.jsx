import React, { useState } from 'react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { supabase } from '../../config/supabaseClient';

const LoadingSpinner = () => (
  <div style={{
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTop: '3px solid white',
    animation: 'spin 1s linear infinite'
  }} />
);

const Auth = () => {
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(provider);
      setError('');
      
      console.log(`Attempting to login with ${provider}...`);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Auth error:', error.message);
      setError(error.message);
    } finally {
      setLoading('');
    }
  };
  
  return (
    <div style={{
      maxWidth: '400px',
      margin: '2rem auto',
      padding: '2rem',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        color: '#333'
      }}>
        Sign in with
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button
          onClick={() => handleSocialLogin('github')}
          disabled={!!loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            border: 'none',
            borderRadius: '4px',
            background: '#24292e',
            color: 'white',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading === 'github' ? (
            <LoadingSpinner />
          ) : (
            <>
              <FaGithub size={20} />
              <span>Continue with GitHub</span>
            </>
          )}
        </button>

        <button
          onClick={() => handleSocialLogin('google')}
          disabled={!!loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: 'white',
            color: '#666',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading === 'google' ? (
            <LoadingSpinner />
          ) : (
            <>
              <FaGoogle size={20} />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {error && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            borderRadius: '4px',
            background: '#fee2e2',
            color: '#ef4444',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Auth; 