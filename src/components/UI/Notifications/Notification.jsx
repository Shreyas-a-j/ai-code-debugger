import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const NotificationWrapper = styled(motion.div)`
  padding: 1rem;
  border-radius: 8px;
  background: ${props => {
    switch (props.type) {
      case 'success': return props.theme.success;
      case 'error': return props.theme.error;
      case 'warning': return '#F6E05E';
      default: return props.theme.accent;
    }
  }};
  color: white;
  min-width: 300px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Notification = ({ type, message }) => {
  return (
    <NotificationWrapper
      type={type}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.2 }}
    >
      {message}
    </NotificationWrapper>
  );
};

export default Notification; 