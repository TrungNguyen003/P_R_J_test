import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import axios from 'axios';

const container = document.getElementById('root');
const root = createRoot(container);

// Set up Axios interceptors
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
   document.getElementById('root')
);
