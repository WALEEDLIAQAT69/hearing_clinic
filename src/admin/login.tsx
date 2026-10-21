import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdminLoginApp } from './AdminLoginApp';
import '../index.css';

const rootElement = document.getElementById('admin-login-root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AdminLoginApp />
    </React.StrictMode>
  );
}
