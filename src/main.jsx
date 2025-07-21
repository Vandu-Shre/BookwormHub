// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App.jsx';
import './index.scss'; // Global styles for body, etc.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* NavBar will now be directly rendered by root, not nested inside .App */}
      <App />
    </Provider>
  </React.StrictMode>,
);