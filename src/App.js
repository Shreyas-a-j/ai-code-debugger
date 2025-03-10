import React from 'react';
import Auth from './components/Auth/Auth';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: '#333',
          marginBottom: '2rem',
          fontSize: '2rem'
        }}>
          AI Code Debugger
        </h1>
        <Auth />
      </div>
    </div>
  );
}

export default App; 