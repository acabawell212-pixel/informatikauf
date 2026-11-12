import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UiSounds } from './components/effects/UiSounds';
// Seluruh gaya (design token + komponen + tema + override) dimuat lewat satu entry ini.
import './core/styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <UiSounds />
  </React.StrictMode>,
);
