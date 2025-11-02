import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { CartProvider } from './context/CartContext'; // ✅ correct import
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
        <CartProvider>
          {/* contexts */}
          <App />
        </CartProvider>
      </AuthProvider>
  </React.StrictMode>
); // ✅ <---- you missed this closing parenthesis and semicolon
