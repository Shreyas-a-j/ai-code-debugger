import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { supabase } from '../../config/supabaseClient';

// Clean header with no avatar references
const HeaderContainer = styled.header`
  background: ${props => props.theme.surface};
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const Logo = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: ${props => props.theme.text.primary};
`;

const LogoSubtitle = styled.span`
  font-size: 0.9rem;
  color: ${props => props.theme.text.secondary};
  margin-top: 0.25rem;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// Completely redesigned logout button
const SignOutLink = styled.a`
  display: inline-block;
  padding: 8px 16px;
  background-color: transparent;
  color: ${props => props.theme.text.primary};
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.accent};
    color: white;
    border-color: ${props => props.theme.accent};
  }
`;

const ThemeButton = styled(motion.button)`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.theme.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
`;

const NewHeader = ({ isDarkMode, onThemeToggle, user }) => {
  const handleSignOut = (e) => {
    e.preventDefault();
    supabase.auth.signOut();
  };

  return (
    <HeaderContainer>
      <Logo>
        <LogoTitle>AI Code Debugger</LogoTitle>
        <LogoSubtitle>Created by Shreyas Jadhav</LogoSubtitle>
      </Logo>
      
      <Controls>
        {user && (
          <SignOutLink 
            href="#" 
            onClick={handleSignOut}
          >
            Sign Out
          </SignOutLink>
        )}
        
        <ThemeButton
          onClick={onThemeToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isDarkMode ? '🌞' : '🌙'}
        </ThemeButton>
      </Controls>
    </HeaderContainer>
  );
};

export default NewHeader; 