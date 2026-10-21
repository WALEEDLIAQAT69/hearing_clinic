import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdminDashboardApp } from './AdminDashboardApp';
import '../index.css';

const rootElement = document.getElementById('admin-dashboard-root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AdminDashboardApp />
    </React.StrictMode>
  );
}
