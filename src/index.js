import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

console.log('Starting React application...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Could not find root element');
  }

  console.log('Found root element, creating React root...');
  const root = ReactDOM.createRoot(rootElement);

  console.log('Rendering App component...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('Initial render complete');

} catch (error) {
  console.error('Failed to start React application:', error);
  // Display error on page
  document.body.innerHTML = `
    <div style="color: red; padding: 20px; text-align: center;">
      <h1>Error Starting Application</h1>
      <pre>${error.message}</pre>
    </div>
  `;
}
