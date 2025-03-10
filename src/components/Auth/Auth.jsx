import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { supabase } from '../../config/supabaseClient';

const AuthContainer = styled(motion.div)`
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  background: ${props => props.theme.surface};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: ${props => props.theme.text.primary};
`;

const EmailForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text.primary};
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.accent};
  }
`;

const SubmitButton = styled(motion.button)`
  padding: 12px;
  background: ${props => props.theme.accent};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.error};
  font-size: 14px;
  text-align: center;
  margin-top: 1rem;
`;

const ToggleAuthButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.accent};
  cursor: pointer;
  font-size: 14px;
  margin-top: 1rem;
  text-align: center;
  width: 100%;

  &:hover {
    text-decoration: underline;
  }
`;

const PasswordRequirements = styled.div`
  font-size: 12px;
  color: ${props => props.theme.text.secondary};
  margin-top: 0.5rem;
`;

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);

      if (isSignUp) {
        // Validate passwords match
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Validate password requirements
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: undefined,
            data: {
              email_confirmed: true
            }
          }
        });
        if (error) throw error;
        
        // Automatically sign in after successful registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Title>Welcome to AI Code Debugger</Title>
      
      <EmailForm onSubmit={handleEmailAuth}>
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {isSignUp && (
          <>
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <PasswordRequirements>
              Password must be at least 8 characters long
            </PasswordRequirements>
          </>
        )}
        <SubmitButton
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </SubmitButton>
      </EmailForm>

      <ToggleAuthButton onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
      </ToggleAuthButton>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </AuthContainer>
  );
};

export default Auth; 