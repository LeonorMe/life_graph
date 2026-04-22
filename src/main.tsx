import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Failed to find the root element');
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (err) {
    console.error('Initial render failed:', err);
    rootElement.innerHTML = `
      <div style="padding: 2rem; color: white; text-align: center; font-family: sans-serif;">
        <h2>Something went wrong</h2>
        <p>The app failed to start. Please try refreshing or clearing your data.</p>
        <button onclick="localStorage.clear(); location.reload();" style="padding: 0.5rem 1rem; background: #3b82f6; border: none; border-radius: 8px; color: white; cursor: pointer;">
          Clear Data & Reset
        </button>
      </div>
    `;
  }
}

// Global error handling for better debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
