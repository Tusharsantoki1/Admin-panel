import React from 'react';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = true , confirmText }) {
  if (!open) return null;
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h3 style={styles.title}>{title || 'Confirm Action'}</h3>
        <p style={styles.msg}>{message || 'Are you sure? This cannot be undone.'}</p>
        <div style={styles.footer}>
          <button style={styles.btnCancel} onClick={onCancel}>Cancel</button>
          <button
            style={danger ? styles.btnDanger : styles.btnPrimary}
            onClick={onConfirm}
          >
            {confirmText || (danger ? 'Delete' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.32)',
    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: '#fff', borderRadius: 14, padding: 24, width: 380,
    border: '0.5px solid #e5e5e0',
  },
  title: { fontSize: 16, fontWeight: 500, marginBottom: 8, color: '#1a1a18' },
  msg: { fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 20 },
  footer: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  btnCancel: {
    padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
    border: '0.5px solid #ccc', background: '#fff', color: '#333',
  },
  btnDanger: {
    padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
    border: '0.5px solid #A32D2D', background: '#FCEBEB', color: '#A32D2D',
  },
  btnPrimary: {
    padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
    border: 'none', background: '#534AB7', color: '#fff',
  },
};
