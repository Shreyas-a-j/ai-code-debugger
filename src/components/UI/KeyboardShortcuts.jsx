import React from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { keyboardService } from '../../services/utils/keyboardService';

const Modal = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${props => props.theme.surface};
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 400px;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const ShortcutList = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
`;

const ShortcutItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const KeyCombo = styled.span`
  background: ${props => props.theme.background};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
`;

const KeyboardShortcuts = ({ isOpen, onClose }) => {
  const shortcuts = keyboardService.getShortcuts();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <Modal
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <h2>Keyboard Shortcuts</h2>
            <ShortcutList>
              {shortcuts.map(({ key, description }) => (
                <ShortcutItem key={key}>
                  <span>{description}</span>
                  <KeyCombo>Ctrl + {key.toUpperCase()}</KeyCombo>
                </ShortcutItem>
              ))}
            </ShortcutList>
          </Modal>
        </>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcuts; 