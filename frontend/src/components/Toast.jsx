import { useState, useEffect } from 'react';
import './Toast.css';

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        {type === 'success' && <i className="fa-solid fa-check-circle"></i>}
        {type === 'error' && <i className="fa-solid fa-exclamation-circle"></i>}
        {type === 'warning' && <i className="fa-solid fa-triangle-exclamation"></i>}
        {type === 'info' && <i className="fa-solid fa-info-circle"></i>}
        <span>{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>
        <i className="fa-solid fa-times"></i>
      </button>
    </div>
  );
}
