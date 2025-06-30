import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { seedInitialData } from './lib/seedData';
import { initializeEmailJS } from './services/emailService';

// Seed initial data on app start
seedInitialData();

// Initialize EmailJS
initializeEmailJS();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);