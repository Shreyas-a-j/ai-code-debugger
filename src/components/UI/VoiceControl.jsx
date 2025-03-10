import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceService } from '../../services/utils/voiceService';

const VoiceButton = styled(motion.button)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.theme.accent};
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const VoiceIndicator = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid ${props => props.theme.accent};
`;

const VoiceControl = ({ onDebug, onOptimize, onDownload }) => {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (voiceService.isSupported()) {
      voiceService.setupVoiceCommands({
        onDebug,
        onOptimize,
        onDownload,
      });
    }
  }, [onDebug, onOptimize, onDownload]);

  const toggleVoiceRecognition = () => {
    if (isListening) {
      voiceService.stopListening();
    } else {
      voiceService.startListening();
    }
    setIsListening(!isListening);
  };

  if (!voiceService.isSupported()) {
    return null;
  }

  return (
    <VoiceButton
      onClick={toggleVoiceRecognition}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence>
        {isListening && (
          <VoiceIndicator
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ scale: 1, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
      🎤
    </VoiceButton>
  );
};

export default VoiceControl; 