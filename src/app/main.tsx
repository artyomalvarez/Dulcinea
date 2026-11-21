import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
    <Toaster position="bottom-right" richColors closeButton />
  </ErrorBoundary>
);
