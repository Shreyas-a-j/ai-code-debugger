import React, { forwardRef, useImperativeHandle, useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../../services/ai/aiService';
import { notificationService } from '../../services/utils/notificationService';
import { historyService } from '../../services/utils/historyService';
import Editor from '@monaco-editor/react';

const DebuggerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
`;

const AnalysisSection = styled.div`
  background: ${props => props.theme.surface};
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.border};
`;

const Button = styled(motion.button)`
  background: ${props => props.theme.accent};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ErrorList = styled.ul`
  color: ${props => props.theme.error};
  margin-left: 1.5rem;
  margin-top: 0.5rem;
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: ${props => props.theme.text.secondary};
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 1;
  
  &:hover {
    color: ${props => props.theme.text.primary};
  }
`;

const ComparisonView = styled(motion.div)`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
  opacity: 0;
  height: 300px;
`;

const DiffSection = styled.div`
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  overflow: hidden;

  h4 {
    background: ${props => props.theme.surface};
    margin: 0;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid ${props => props.theme.border};
  }
`;

const DiffHighlight = styled.span`
  background: ${props => props.type === 'addition' ? props.theme.success + '30' : props.theme.error + '30'};
  padding: 0 2px;
`;

const ActionButton = styled(motion.button)`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.text.primary};
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: ${props => props.theme.accent};
    color: white;
    border-color: ${props => props.theme.accent};
  }
`;

const ActionBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
`;

const ChatInput = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text.primary};
  resize: vertical;
  min-height: 100px;
  margin-top: 1rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.accent};
  }
`;

const ChatButton = styled(motion.button)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 9999;

  &:hover {
    transform: scale(1.1);
    background: #0056b3;
  }
`;

const ChatWindow = styled(motion.div)`
  position: fixed;
  bottom: 5rem;
  right: 2rem;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 9998;
  overflow: hidden;
  border: 1px solid #e0e0e0;
`;

const ChatHeader = styled.div`
  padding: 1rem;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div`
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: ${props => props.isUser ? '#007bff' : '#f0f0f0'};
  color: ${props => props.isUser ? 'white' : '#333'};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  word-wrap: break-word;
  margin: 0.5rem 0;
`;

const ChatInputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid ${props => props.theme.border};
  display: flex;
  gap: 0.5rem;
`;

const ChatInputField = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  color: #333;
  outline: none;

  &:focus {
    border-color: #007bff;
  }
`;

const SendButton = styled(motion.button)`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #0056b3;
  }
`;

const LanguageSelector = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  margin-right: 1rem;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1em;
  padding-right: 2.5rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  &:hover {
    border-color: #007bff;
  }
`;

const ChatHeaderContent = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  gap: 1rem;
`;

const LanguageLabel = styled.span`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  margin-right: 0.5rem;
`;

const AIDebugger = forwardRef(({ code, language, isProcessing, setIsProcessing, onCodeOptimized, onLanguageChange }, ref) => {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [originalCode, setOriginalCode] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLanguage, setChatLanguage] = useState(language);

  const handleDebug = useCallback(async () => {
    if (!code) {
      notificationService.warning('Please enter some code to analyze');
      return;
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      setOriginalCode(code);
      
      const result = await aiService.analyzeCode(code, language);
      
      if (result.optimizedCode && result.optimizedCode !== code) {
        historyService.addToHistory(code);
        setAnalysis(result);
        setShowComparison(true);
        
        onCodeOptimized(result.optimizedCode);
        notificationService.success('✅ Code optimized and replaced successfully!');
      } else {
        setAnalysis(result);
        notificationService.info('Code is already optimized!');
      }
    } catch (err) {
      setError(err.message);
      notificationService.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [code, language, onCodeOptimized, setIsProcessing]);

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setChatLanguage(newLanguage);
    onLanguageChange(newLanguage);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      setIsProcessing(true);
      let response;
      
      if (chatLanguage === 'general') {
        // For general chat, use a more conversational prompt
        if (userMessage.toLowerCase().includes('what can you do') || 
            userMessage.toLowerCase().includes('help me') ||
            userMessage.toLowerCase().includes('abilities')) {
          response = "I'm your friendly AI coding assistant! I can help you with:\n\n" +
                    "💻 Writing and debugging code\n" +
                    "🔄 Optimizing and enhancing code\n" +
                    "🔍 Finding and fixing bugs\n" +
                    "📝 Explaining code concepts\n" +
                    "💡 Suggesting improvements\n\n" +
                    "Just ask me anything about coding!";
        } else {
          response = await aiService.chatWithAI(
            `Let's have a friendly conversation. ${userMessage}`,
            '',
            'general'
          );
        }
      } else {
        // For code-related chat, use the existing logic
        response = await aiService.chatWithAI(userMessage, code || '', chatLanguage);
        
        // If the message contains code, try to update the editor
        if (response.includes('```')) {
          const codeMatch = response.match(/```[\w-]*\n([\s\S]*?)```/);
          if (codeMatch) {
            const newCode = codeMatch[1].trim();
            historyService.addToHistory(newCode);
            onCodeOptimized(newCode);
            notificationService.success('Code updated from chat!');
          }
        }
      }
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      notificationService.error('Failed to get AI response');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!chatInput.trim()) {
      notificationService.warning('Please describe the code you want to generate');
      return;
    }

    try {
      setIsProcessing(true);
      const generatedCode = await aiService.generateCode(chatInput, language);
      
      if (generatedCode) {
        setChatHistory(prev => [...prev, 
          { role: 'user', content: `Generate code for: ${chatInput}` },
          { role: 'assistant', content: `Here's the generated code:\n\`\`\`${language}\n${generatedCode}\n\`\`\`` }
        ]);
        
        historyService.addToHistory(generatedCode);
        onCodeOptimized(generatedCode);
        
        setChatInput('');
        notificationService.success('✅ Code generated successfully!');
      }
    } catch (error) {
      console.error('Code generation error:', error);
      notificationService.error('Failed to generate code. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFixCode = async () => {
    try {
      setIsProcessing(true);
      const fixedCode = await aiService.fixCode(code, chatInput, language);
      if (fixedCode) {
        historyService.addToHistory(fixedCode);
        onCodeOptimized(fixedCode);
        notificationService.success('✅ Code fixed successfully!');
      }
    } catch (error) {
      notificationService.error('Failed to fix code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnhanceCode = async () => {
    try {
      setIsProcessing(true);
      const enhancedCode = await aiService.enhanceCode(code, language);
      if (enhancedCode) {
        historyService.addToHistory(enhancedCode);
        onCodeOptimized(enhancedCode);
        notificationService.success('✅ Code enhanced successfully!');
      }
    } catch (error) {
      notificationService.error('Failed to enhance code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUndo = () => {
    if (historyService.canUndo()) {
      const previousCode = historyService.undo();
      if (previousCode !== null) {
        onCodeOptimized(previousCode);
      }
    }
  };

  const handleRedo = () => {
    if (historyService.canRedo()) {
      const nextCode = historyService.redo();
      if (nextCode !== null) {
        onCodeOptimized(nextCode);
      }
    }
  };

  useImperativeHandle(ref, 
    () => ({
      debugCode: handleDebug
    }),
    [handleDebug]
  );

  return (
    <>
      <DebuggerContainer>
        {code && (
          <>
            <ActionBar>
              <ActionButton
                onClick={handleDebug}
                disabled={isProcessing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔍 Debug & Optimize
              </ActionButton>

              <ActionButton
                onClick={handleEnhanceCode}
                disabled={isProcessing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ⚡ Enhance Code
              </ActionButton>

              <ActionButton
                onClick={handleFixCode}
                disabled={!chatInput.trim() || isProcessing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🛠️ Fix Code
              </ActionButton>

              <ActionButton
                onClick={handleUndo}
                disabled={!historyService.canUndo()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ↩️ Undo
              </ActionButton>

              <ActionButton
                onClick={handleRedo}
                disabled={!historyService.canRedo()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ↪️ Redo
              </ActionButton>
            </ActionBar>

            <AnimatePresence mode="wait">
              {showComparison && (
                <ComparisonView
                  key="comparison"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 300 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CloseButton
                    onClick={() => setShowComparison(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </CloseButton>
                  <DiffSection>
                    <h4>Original Code</h4>
                    <Editor
                      height="250px"
                      language={language}
                      value={originalCode}
                      theme="vs-dark"
                      options={{ readOnly: true, minimap: { enabled: false } }}
                    />
                  </DiffSection>
                  <DiffSection>
                    <h4>Optimized Code</h4>
                    <Editor
                      height="250px"
                      language={language}
                      value={analysis?.optimizedCode}
                      theme="vs-dark"
                      options={{ readOnly: true, minimap: { enabled: false } }}
                    />
                  </DiffSection>
                </ComparisonView>
              )}
            </AnimatePresence>

            {error && (
              <AnalysisSection>
                <p style={{ color: 'red' }}>{error}</p>
              </AnalysisSection>
            )}

            {analysis && (
              <ResultsContainer>
                {analysis.syntaxErrors.length > 0 && (
                  <AnalysisSection>
                    <h4>Syntax Issues</h4>
                    <ErrorList>
                      {analysis.syntaxErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ErrorList>
                  </AnalysisSection>
                )}

                {analysis.logicalErrors.length > 0 && (
                  <AnalysisSection>
                    <h4>Logical Issues & Suggestions</h4>
                    <ErrorList>
                      {analysis.logicalErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ErrorList>
                  </AnalysisSection>
                )}

                {analysis.explanation && (
                  <AnalysisSection>
                    <h4>Optimization Details</h4>
                    <p>{analysis.explanation}</p>
                  </AnalysisSection>
                )}
              </ResultsContainer>
            )}
          </>
        )}
      </DebuggerContainer>

      <ChatButton
        onClick={() => setIsChatOpen(!isChatOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        💬
      </ChatButton>

      <AnimatePresence>
        {isChatOpen && (
          <ChatWindow
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ChatHeader>
              <ChatHeaderContent>
                <LanguageLabel>Language:</LanguageLabel>
                <LanguageSelector
                  value={chatLanguage}
                  onChange={handleLanguageChange}
                  disabled={isProcessing}
                >
                  <option value="general">General Chat</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </LanguageSelector>
                <span>AI Code Assistant</span>
              </ChatHeaderContent>
              <CloseButton onClick={() => setIsChatOpen(false)}>✕</CloseButton>
            </ChatHeader>

            <ChatMessages>
              {chatHistory.map((message, index) => (
                <Message key={index} isUser={message.role === 'user'}>
                  {message.content}
                </Message>
              ))}
            </ChatMessages>

            <ChatInputContainer>
              <ChatInputField
                placeholder={chatLanguage === 'general' 
                  ? "Chat with AI about anything..." 
                  : `Type your message... (${chatLanguage})`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isProcessing}
              />
              <SendButton
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isProcessing}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ➤
              </SendButton>
            </ChatInputContainer>
          </ChatWindow>
        )}
      </AnimatePresence>
    </>
  );
});

AIDebugger.displayName = 'AIDebugger';

export default AIDebugger; 