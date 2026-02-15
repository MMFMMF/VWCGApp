import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initializeRegistry } from './registry/registry';
import { initializeValidation } from './validation';
import { registerCharts } from './lib/charts';

console.log('App starting: Initializing Registry...');
initializeRegistry(); // Registers all tools
// console.log('App starting: Initializing Validation...');
initializeValidation(); // Registers validation profiles
registerCharts(); // Initialize charts


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
