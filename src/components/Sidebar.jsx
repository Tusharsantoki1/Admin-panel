import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="6" height="6" rx="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5"/>
      </svg>
    ),
  },
  {
    id: 'users', label: 'Users',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="5" r="3"/>
        <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
      </svg>
    ),
  },
  {
    id: 'coupon', label: 'Coupon',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="4" width="14" height="8" rx="1.5"/>
        <line x1="5" y1="4" x2="5" y2="12"/>
        <line x1="7" y1="7" x2="9" y2="7"/>
        <line x1="7" y1="9" x2="9" y2="9"/>
      </svg>
    ),
  },
  {
    id: 'plan', label: 'Plan',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="14" height="14" rx="2"/>
        <path d="M5 8h6M5 5h6M5 11h4"/>
      </svg>
    ),
  },
  {
    id: 'permission', label: 'Permission',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="7" width="8" height="7" rx="1.5"/>
        <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/>
        <circle cx="8" cy="10.5" r="1"/>
      </svg>
    ),
  },
   {
    id: 'History', label: 'History',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="7" width="8" height="7" rx="1.5"/>
        <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/>
        <circle cx="8" cy="10.5" r="1"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside style={s.sidebar}>
      <div style={s.logo}>
        <div style={s.logoIcon}>A</div>
        <span style={s.logoText}>AdminPro</span>
      </div>

      <nav style={s.nav}>
        {NAV_ITEMS.map(item => {
          const path = item.id === 'dashboard' ? '/' : `/${item.id}`;
          const isActive = location.pathname === path;

          return (
            <Link
              key={item.id}
              to={path}
              style={{
                ...s.navItem,
                ...(isActive ? s.navActive : {}),
                textDecoration: 'none'
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.55 }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={s.footer}>
        <div style={s.userCard}>
          <div style={s.avatar}>AD</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Admin User</div>
            <div style={{ fontSize: 11, color: '#888' }}>admin@example.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

const s = {
  sidebar: {
    width: 220, flexShrink: 0,
    background: '#fff', borderRight: '0.5px solid #e8e8e4',
    display: 'flex', flexDirection: 'column', height: '100vh',
  },
  logo: {
    padding: '20px 16px 16px',
    borderBottom: '0.5px solid #e8e8e4',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  logoIcon: {
    width: 30, height: 30, borderRadius: 8,
    background: '#534AB7', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 600,
  },
  logoText: { fontSize: 15, fontWeight: 600, color: '#1a1a18' },
  nav: { padding: '10px 8px', flex: 1, overflowY: 'auto' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 12px', borderRadius: 8,
    cursor: 'pointer', fontSize: 13.5,
    color: '#555', background: 'none',
    border: 'none', width: '100%', textAlign: 'left',
    marginBottom: 2, transition: 'all .15s',
    fontFamily: 'inherit',
  },
  navActive: {
    background: '#EEEDFE', color: '#534AB7', fontWeight: 500,
  },
  footer: {
    padding: '12px 12px 16px',
    borderTop: '0.5px solid #e8e8e4',
  },
  userCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px', borderRadius: 8,
    background: '#f9f9f7',
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: '#534AB7', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 600, flexShrink: 0,
  },
};
