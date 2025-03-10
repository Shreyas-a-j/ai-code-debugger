import React, { forwardRef, useImperativeHandle, useCallback } from 'react';
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

const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const IconButton = styled(motion.button)`
  background: ${props => props.theme.surface};
  border: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.text.primary};
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AIDebugger = forwardRef(({ code, language, isProcessing, setIsProcessing, onCodeOptimized }, ref) => {
  const [analysis, setAnalysis] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [showComparison, setShowComparison] = React.useState(false);
  const [originalCode, setOriginalCode] = React.useState('');

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

  const handleOptimize = async () => {
    try {
      setIsProcessing(true);
      const optimizedCode = await aiService.optimizeCode(code, language);
      if (optimizedCode) {
        historyService.addToHistory(optimizedCode);
        onCodeOptimized(optimizedCode);
        notificationService.success('Code optimized successfully!');
      }
    } catch (error) {
      console.error('Optimization error:', error);
      notificationService.error('Failed to optimize code');
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
    <DebuggerContainer>
      <ActionBar>
        <Button
          onClick={handleDebug}
          disabled={!code || isProcessing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isProcessing ? 'Analyzing...' : 'Debug & Optimize Code'}
        </Button>

        <IconButton
          onClick={handleUndo}
          disabled={!historyService.canUndo()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ↩️ Undo
        </IconButton>

        <IconButton
          onClick={handleRedo}
          disabled={!historyService.canRedo()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ↪️ Redo
        </IconButton>
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
    </DebuggerContainer>
  );
});

AIDebugger.displayName = 'AIDebugger';

export default AIDebugger; 