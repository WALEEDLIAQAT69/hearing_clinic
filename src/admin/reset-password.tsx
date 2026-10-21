import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ResetPasswordApp } from './ResetPasswordApp';
import '../index.css';

createRoot(document.getElementById('admin-reset-root')!).render(
  <StrictMode>
    <ResetPasswordApp />
  </StrictMode>
);
