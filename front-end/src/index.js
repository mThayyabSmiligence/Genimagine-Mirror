import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './Context/AuthProvider';
import { RefreshDataProvider } from './Context/RefreshDataProvider';
import {BrowserRouter as Router } from "react-router-dom" 



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <RefreshDataProvider>
          <App />
        </RefreshDataProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
  
);

