import React, { useRef } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const UploadContainer = styled.div`
  margin-bottom: 1rem;
`;

const UploadButton = styled(motion.button)`
  background: ${props => props.theme.surface};
  border: 2px dashed ${props => props.theme.border};
  color: ${props => props.theme.text.primary};
  padding: 1rem;
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    border-color: ${props => props.theme.accent};
    color: ${props => props.theme.accent};
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const FileUpload = ({ onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const extension = file.name.split('.').pop().toLowerCase();
      
      let language = 'javascript';
      if (extension === 'py') language = 'python';
      if (extension === 'cpp' || extension === 'c') language = 'cpp';
      if (extension === 'java') language = 'java';

      onFileUpload(content, language);
    };
    reader.readAsText(file);
  };

  return (
    <UploadContainer>
      <UploadButton
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        📁 Upload Code File
      </UploadButton>
      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept=".js,.py,.cpp,.c,.java"
        onChange={handleFileChange}
      />
    </UploadContainer>
  );
};

export default FileUpload; 