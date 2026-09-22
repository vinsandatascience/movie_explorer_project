import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={20} color="#00e676" />,
    error: <AlertCircle size={20} color="#ff3366" />,
    info: <Info size={20} color="#00f2fe" />
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 20px',
      background: 'rgba(18, 22, 34, 0.95)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: 'var(--radius-md)',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
      color: '#fff',
      fontSize: '0.95rem',
      fontWeight: '500',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {icons[toast.type] || icons.info}
      <span>{toast.message}</span>
      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          marginLeft: '8px'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
