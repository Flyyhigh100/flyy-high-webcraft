
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupDatabaseFunctions } from './setupDatabaseFunctions.ts'

// Initialize database functions
setupDatabaseFunctions().catch(err => {
  console.error("Error setting up database functions:", err);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
