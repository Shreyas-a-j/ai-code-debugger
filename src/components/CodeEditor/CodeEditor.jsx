import React from 'react';
import Editor from '@monaco-editor/react';
import styled from '@emotion/styled';

const EditorContainer = styled.div`
  position: relative;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${props => props.theme.border};
`;

const LanguageSelector = styled.select`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  padding: 0.5rem;
  border-radius: 4px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text.primary};
  border: 1px solid ${props => props.theme.border};
`;

const CodeEditor = ({ code, language, onChange, onLanguageChange }) => {
  return (
    <EditorContainer>
      <LanguageSelector
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
      >
        <option value="cpp">C++</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="javascript">JavaScript</option>
      </LanguageSelector>
      
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={onChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </EditorContainer>
  );
};

export default CodeEditor; 