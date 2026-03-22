import { useState, useCallback } from 'react';
import Toast from './Toast';
import './Toast.css';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  window.addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  window.showSuccess = useCallback((message) => {
    window.addToast(message, 'success', 2500);
  }, []);

  window.showError = useCallback((message) => {
    window.addToast(message, 'error', 3500);
  }, []);

  window.showWarning = useCallback((message) => {
    window.addToast(message, 'warning', 3000);
  }, []);

  window.showInfo = useCallback((message) => {
    window.addToast(message, 'info', 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
