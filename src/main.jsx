import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import './styles/lettering.css';
import './styles/logo.css';
import './styles/radar.css';
import './styles/meme-shortlist.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
