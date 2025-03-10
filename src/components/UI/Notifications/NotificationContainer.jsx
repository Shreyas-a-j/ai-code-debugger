import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { notificationService } from '../../../services/utils/notificationService';
import Notification from './Notification';

const Container = styled(motion.div)`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const subscription = notificationService.notifications$.subscribe(notification => {
      setNotifications(prev => [...prev, notification]);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, notification.duration);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Container>
      <AnimatePresence>
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
          />
        ))}
      </AnimatePresence>
    </Container>
  );
};

export default NotificationContainer; 