import React, { useEffect, useState } from 'react'; // ✅ CHANGED
import { Badge } from '../components/Badge';
import BASE_URL from '../api/config'; // ✅ CHANGED

function StatCard({ label, value, icon, trend, iconBg, iconColor }) {
  return (
    <div style={s.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={s.cardLabel}>{label}</div>
        <div style={{ ...s.cardIcon, background: iconBg, color: iconColor }}>{icon}</div>
      </div>
      <div style={s.cardVal}>{value}</div>
      {trend && (
        <div style={s.cardFoot}>
          <span style={s.trend}>{trend.label}</span>
          <span style={{ color: '#999' }}>{trend.text}</span>
        </div>
      )}
    </div>
  );
}

// ❌ removed users from props
export default function DashboardPage({ onNavigate }) {

  // ✅ CHANGED: separate states
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    today: 0,
  });
  const [loading, setLoading] = useState(true);

  // ✅ CHANGED: fetch BOTH APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // stats API
        const statsRes = await fetch(`${BASE_URL}/dashboard/stats`);
        const statsData = await statsRes.json();

        // recent users API
        const usersRes = await fetch(`${BASE_URL}/dashboard/recent-users`);
        const usersData = await usersRes.json();

        setStats(statsData);
        setUsers(usersData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ loading
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={s.header}>
        <div>
          <div style={s.title}>Dashboard</div>
          <div style={s.sub}>Welcome back, Admin 👋</div>
        </div>
      </div>

      <div style={s.cards}>
        {/* ✅ CHANGED: using stats instead of calculating */}
        <StatCard
          label="Total Users"
          value={stats.total.toLocaleString()}
          icon="👥"
          iconBg="#EEEDFE" iconColor="#534AB7"
          trend={{ label: '+12%', text: 'vs last month' }}
        />

        <StatCard
          label="Active Users"
          value={stats.active.toLocaleString()}
          icon="✓"
          iconBg="#EAF3DE" iconColor="#3B6D11"
          trend={{ label: '+8%', text: 'vs last month' }}
        />

        <StatCard
          label="Today's Registrations"
          value={stats.today}
          icon="✦"
          iconBg="#E6F1FB" iconColor="#185FA5"
          trend={{ label: '+5%', text: 'vs yesterday' }}
        />
      </div>

      <div style={s.tableCard}>
        <div style={s.tableHeader}>
          <span style={s.tableTitle}>Recent Users</span>
          <button style={s.viewAll} onClick={() => onNavigate('users')}>
            View all →
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Name','Email','Status','Role','Country','Joined'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {users.slice(0, 11).map(u => (
                <tr key={u.id} style={s.tr}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={s.miniAvatar}>
                        {u.first_name[0]}{u.last_name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>
                          {u.first_name} {u.last_name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ ...s.td, color: '#666', fontSize: 12 }}>{u.email}</td>
                  <td style={s.td}><Badge label={u.status} /></td>
                  <td style={s.td}><Badge label={u.role} /></td>
                  <td style={{ ...s.td, fontSize: 12 }}>{u.country}</td>
                  <td style={{ ...s.td, color: '#888', fontSize: 12 }}>{u.created_at}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

const s = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 600, color: '#1a1a18' },
  sub: { fontSize: 13, color: '#888', marginTop: 2 },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 },
  card: {
    background: '#fff', border: '0.5px solid #e8e8e4',
    borderRadius: 12, padding: '18px 20px',
  },
  cardLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 500 },
  cardVal: { fontSize: 30, fontWeight: 600, lineHeight: 1, color: '#1a1a18' },
  cardFoot: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12 },
  cardIcon: {
    width: 36, height: 36, borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
  },
  trend: {
    background: '#EAF3DE', color: '#3B6D11',
    padding: '2px 6px', borderRadius: 5, fontSize: 11, fontWeight: 500,
  },
  tableCard: {
    background: '#fff', border: '0.5px solid #e8e8e4',
    borderRadius: 12, overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', borderBottom: '0.5px solid #e8e8e4',
  },
  tableTitle: { fontWeight: 600, fontSize: 14 },
  viewAll: {
    fontSize: 13, color: '#534AB7', background: 'none',
    border: 'none', cursor: 'pointer', fontWeight: 500,
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    padding: '10px 16px', textAlign: 'left', fontSize: 12,
    fontWeight: 500, color: '#888', background: '#f9f9f7',
    borderBottom: '0.5px solid #e8e8e4',
  },
  tr: { borderBottom: '0.5px solid #f0f0ee' },
  td: { padding: '12px 16px', verticalAlign: 'middle' },
  miniAvatar: {
    width: 28, height: 28, borderRadius: '50%',
    background: '#EEEDFE', color: '#534AB7',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 600, flexShrink: 0,
  },
};
