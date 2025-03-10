import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { supabase, checkSupabaseConnection } from '../../config/supabaseClient';

const AuthContainer = styled.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: ${props => props.theme.surface};
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text.primary};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #7C3AED;
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background: #7C3AED;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #6D28D9;
  }

  &:disabled {
    background: #9F7AEA;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
  padding: 0.5rem;
  background-color: #fee2e2;
  border-radius: 4px;
  border: 1px solid #fecaca;
`;

const SuccessMessage = styled.div`
  color: #059669;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
  padding: 0.5rem;
  background-color: #d1fae5;
  border-radius: 4px;
  border: 1px solid #a7f3d0;
`;

const ToggleText = styled.p`
  text-align: center;
  margin-top: 1rem;
  color: ${props => props.theme.text.secondary};

  span {
    color: #7C3AED;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Check connection status when component mounts
  useEffect(() => {
    checkConnection();
    
    // Add connection status listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = async () => {
    const isConnected = await checkSupabaseConnection();
    setIsConnected(isConnected);
    if (!isConnected) {
      setError('Unable to connect to the server. Please check your internet connection.');
    } else {
      setError('');
    }
  };

  const handleOnline = async () => {
    console.log('Internet connection restored');
    await checkConnection();
  };

  const handleOffline = () => {
    console.log('Internet connection lost');
    setIsConnected(false);
    setError('No internet connection. Please check your network.');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!isConnected) {
      setError('No internet connection. Please check your network and try again.');
      return false;
    }

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setError('No internet connection. Please check your network and try again.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Check connection before proceeding
      const connectionStatus = await checkSupabaseConnection();
      if (!connectionStatus) {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }
      
      if (isSignUp) {
        // First, check if the email already exists
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', formData.email)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
          throw checkError;
        }

        if (existingUser) {
          throw new Error('An account with this email already exists');
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              email: formData.email,
            }
          }
        });

        if (error) throw error;
        
        if (data?.user) {
          // Create a profile for the user
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: formData.email,
                created_at: new Date().toISOString(),
              }
            ]);

          if (profileError) throw profileError;

          setSuccess('Account created successfully! You can now sign in.');
          setIsSignUp(false);
          setFormData(prev => ({
            ...prev,
            confirmPassword: ''
          }));
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        setSuccess('Signed in successfully!');
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (!navigator.onLine || error.message.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (error.message.includes('rate limit')) {
        setError('Too many attempts. Please wait a moment and try again.');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <AuthContainer>
      <Form onSubmit={handleSubmit}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
        
        <Input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleInputChange}
          required
          disabled={loading}
        />
        
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
          disabled={loading}
        />

        {isSignUp && (
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        )}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoadingSpinner />
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </>
          ) : (
            isSignUp ? 'Sign Up' : 'Sign In'
          )}
        </Button>

        <ToggleText>
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <span onClick={toggleMode}>Sign In</span>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <span onClick={toggleMode}>Sign Up</span>
            </>
          )}
        </ToggleText>
      </Form>
    </AuthContainer>
  );
};

export default Auth; 