import React, { useState } from 'react';

export default function ActionMenu({ onEdit, onDelete, extraActions = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', textAlign: 'center' }}>
      <button
        style={dotBtn}
        onClick={() => setOpen(prev => !prev)}
      >
        ⋮
      </button>

      {open && (
        <div style={menu}>
          
          {/* EDIT */}
          <div
            style={item}
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
          >
            Edit
          </div>
            
            {/* 🔥 EXTRA ACTIONS (NEW) */}
          {extraActions.map((action, i) => (
            <div
              key={i}
              style={item}
              onClick={() => {
                action.onClick();
                setOpen(false);
              }}
            >
              {action.label}
            </div>
          ))}


          {/* DELETE */}
          <div
            style={{ ...item, color: '#A32D2D' }}
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
          >
            Delete
          </div>

        

        </div>
      )}
    </div>
  );
}

/* styles */
const dotBtn = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: 18,
  padding: 4,
};

const menu = {
  position: 'absolute',
  top: 24,
  right: 0,
  background: '#fff',
  border: '1px solid #eee',
  borderRadius: 6,
  boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
  zIndex: 9999,
  minWidth: 120
};

const item = {
  padding: '6px 10px',
  cursor: 'pointer',
  fontSize: 12,
  whiteSpace: 'nowrap',
  userSelect: 'none'
};