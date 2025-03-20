import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './Context/AuthProvider';
import { RefreshDataProvider } from './Context/RefreshDataProvider';
import { DropdownProvider } from './Context/DropdownProvider';


import {BrowserRouter as Router } from "react-router-dom" 

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";




const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <RefreshDataProvider>
          <DropdownProvider>
            <App />
          </DropdownProvider>
        </RefreshDataProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
  
);

