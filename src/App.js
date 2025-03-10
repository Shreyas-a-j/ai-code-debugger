import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { ThemeProvider } from '@emotion/react';
import { lightTheme, darkTheme } from './styles/theme';
import NewHeader from './components/UI/NewHeader';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { keyboardService } from './services/utils/keyboardService';
import { notificationService } from './services/utils/notificationService';
import { historyService } from './services/utils/historyService';

// Lazy load components to reduce initial bundle size
const CodeEditor = React.lazy(() => import('./components/CodeEditor/CodeEditor'));
const Auth = React.lazy(() => import('./components/Auth/Auth'));
const AIDebugger = React.lazy(() => import('./components/AIDebugger/AIDebugger'));
const FileUpload = React.lazy(() => import('./components/UI/FileUpload'));
const VoiceControl = React.lazy(() => import('./components/UI/VoiceControl'));
const NotificationContainer = React.lazy(() => import('./components/UI/Notifications/NotificationContainer'));
const KeyboardShortcuts = React.lazy(() => import('./components/UI/KeyboardShortcuts'));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    Loading...
  </div>
);

const AppContent = ({ isDarkMode, setIsDarkMode }) => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleVoiceDebug = useCallback(async () => {
    try {
      setIsProcessing(true);
      notificationService.success('Code analysis complete!');
    } catch (error) {
      notificationService.error('Failed to analyze code');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleVoiceOptimize = useCallback(() => {
    notificationService.info('Optimizing code...');
  }, []);

  const handleVoiceDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language}`;
    a.click();
    window.URL.revokeObjectURL(url);
    notificationService.success('Code downloaded successfully!');
  }, [code, language]);

  const handleCodeOptimized = useCallback((optimizedCode) => {
    setCode(optimizedCode);
    historyService.addToHistory(optimizedCode);
  }, []);

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
    try {
      historyService.addToHistory(newCode);
    } catch (error) {
      console.error('Failed to update history:', error);
    }
  }, []);

  const handleUndo = useCallback(() => {
    const previousCode = historyService.undo();
    if (previousCode !== null) {
      setCode(previousCode);
    }
  }, []);

  const handleRedo = useCallback(() => {
    const nextCode = historyService.redo();
    if (nextCode !== null) {
      setCode(nextCode);
    }
  }, []);

  useEffect(() => {
    keyboardService.register('d', handleVoiceDebug, 'Debug Code');
    keyboardService.register('o', handleVoiceOptimize, 'Optimize Code');
    keyboardService.register('s', handleVoiceDownload, 'Save/Download Code');
    keyboardService.register('/', () => setIsShortcutsModalOpen(true), 'Show Keyboard Shortcuts');
    keyboardService.register('z', handleUndo, 'Undo', { ctrl: true });
    keyboardService.register('y', handleRedo, 'Redo', { ctrl: true });
    
    keyboardService.enable();
    return () => keyboardService.disable();
  }, [handleVoiceDebug, handleVoiceOptimize, handleVoiceDownload, handleUndo, handleRedo]);

  if (!user) {
    return (
      <div className="app">
        <NewHeader 
          isDarkMode={isDarkMode} 
          onThemeToggle={toggleTheme}
        />
        <Suspense fallback={<LoadingFallback />}>
          <Auth />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="app">
      <NewHeader 
        isDarkMode={isDarkMode} 
        onThemeToggle={toggleTheme}
        user={user}
      />
      <main className="main-content">
        <Suspense fallback={<LoadingFallback />}>
          <ErrorBoundary>
            <FileUpload 
              onFileUpload={(content, lang) => {
                setCode(content);
                setLanguage(lang);
                historyService.addToHistory(content);
              }} 
            />
            <CodeEditor
              code={code}
              language={language}
              onChange={handleCodeChange}
              onLanguageChange={setLanguage}
            />
            <AIDebugger
              code={code}
              language={language}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              onCodeOptimized={handleCodeOptimized}
            />
          </ErrorBoundary>
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <VoiceControl
          onDebug={handleVoiceDebug}
          onOptimize={handleVoiceOptimize}
          onDownload={handleVoiceDownload}
        />
        <NotificationContainer />
        <KeyboardShortcuts
          isOpen={isShortcutsModalOpen}
          onClose={() => setIsShortcutsModalOpen(false)}
        />
      </Suspense>
    </div>
  );
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <GlobalStyles />
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <AppContent isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App; 