import React, { useState, useCallback, useRef } from 'react';

const ToastContext = React.createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++idRef.current;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div style={styles.wrap}>
        {toasts.map(t => (
          <div key={t.id} style={{ ...styles.toast, ...styles[t.type] }}>
            <span style={styles.icon}>{t.type === 'success' ? '✓' : '✗'}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}

const styles = {
  wrap: {
    position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  toast: {
    padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: 8,
    animation: 'slideIn .25s ease',
    border: '0.5px solid',
  },
  success: {
    background: '#EAF3DE', color: '#3B6D11', borderColor: '#3B6D11',
  },
  error: {
    background: '#FCEBEB', color: '#A32D2D', borderColor: '#A32D2D',
  },
  icon: { fontWeight: 700, fontSize: 14 },
};
