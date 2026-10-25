import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import Admin from './Admin.jsx';
import './style.css';

const isAdminPage = window.location.pathname.replace(/\/+$/, '') === '/admin';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdminPage ? <Admin /> : <App />}
  </React.StrictMode>
);
