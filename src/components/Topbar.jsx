import React, { useState } from 'react';
import { useToast } from './Toast';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ onSearch, results = [] }) {
  const [query, setQuery] = useState('');
  const toast = useToast();
  const navigate = useNavigate();
  function handleSearch(e) {
    const value = e.target.value;
    setQuery(value);
    onSearch && onSearch(value);
  }

  return (
    <header style={s.topbar}>
      
      <div style={s.searchWrap}>
        
        <span style={s.searchIcon}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#999" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5"/>
            <path d="M11 11l3 3"/>
          </svg>
        </span>

        <input
          style={s.searchInput}
          placeholder="Search anything..."
          value={query}
          onChange={handleSearch}
        />

        {/* 🔥 GLOBAL SEARCH DROPDOWN */}
        {query.length > 0 && (
          <div style={s.dropdown}>
            {results.length === 0 ? (
              <div style={s.noResult}>No users found</div>
            ) : (
              results.slice(0, 6).map(user => (
                <div key={user.id} style={s.item}  onClick={() => {
    navigate(`/user/${user.id}`);
    setQuery(''); // optional: clear search
  }}>
                  
                  <div style={{ fontWeight: 500 }}>
                    {user.first_name} {user.last_name}
                  </div>

                  <div style={{ fontSize: 12, color: '#888' }}>
                    {user.email}
                  </div>

                  <div style={{ fontSize: 12, color: '#aaa' }}>
                    {user.phone_number}
                  </div>

                </div>
              ))
            )}
          </div>
        )}

      </div>

      <div style={s.right}>
        <button
          style={s.iconBtn}
          onClick={() => toast('3 new notifications', 'success')}
          title="Notifications"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 2a5 5 0 0 1 5 5v2l1.5 2.5H1.5L3 9V7a5 5 0 0 1 5-5z"/>
            <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0"/>
          </svg>
          <span style={s.notifDot} />
        </button>

        <div style={s.avatar}>AD</div>
      </div>
    </header>
  );
}

const s = {
  topbar: {
    height: 56,
    background: '#fff',
    borderBottom: '0.5px solid #e8e8e4',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    gap: 12,
    flexShrink: 0,
  },

  searchWrap: {
    flex: 1,
    maxWidth: 340,
    position: 'relative', // ✅ IMPORTANT
  },

  searchIcon: {
    position: 'absolute',
    left: 10,
    top: '50%',
    transform: 'translateY(-50%)',
  },

  searchInput: {
    width: '100%',
    padding: '7px 12px 7px 32px',
    border: '0.5px solid #e5e5e0',
    borderRadius: 8,
    fontSize: 13,
    background: '#f9f9f7',
    outline: 'none',
  },

  /* 🔥 NEW STYLES */
  dropdown: {
    position: 'absolute',
    top: '110%',
    left: 0,
    width: '100%',
    background: '#fff',
    border: '0.5px solid #e5e5e0',
    borderRadius: 10,
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
    zIndex: 1000,
    maxHeight: 260,
    overflowY: 'auto',
  },

  item: {
    padding: '10px 12px',
    borderBottom: '0.5px solid #eee',
    cursor: 'pointer',
  },

  noResult: {
    padding: 12,
    fontSize: 13,
    color: '#999',
  },

  right: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },

  iconBtn: {
    position: 'relative',
    cursor: 'pointer',
    padding: 7,
    borderRadius: 8,
    border: '0.5px solid #e5e5e0',
    background: 'none',
  },

  notifDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    background: '#E24B4A',
    borderRadius: '50%',
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#534AB7',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
  },
};