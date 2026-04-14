import React from 'react';
import { useParams } from 'react-router-dom';

export default function UserDetailsPage({ users }) {
  const { id } = useParams();

  const user = users.find(u => String(u.id) === id);

  if (!user) return <div style={{ padding: 20 }}>User not found</div>;

  return (
    <div style={{ padding: 20 }}>

      {/* 🔵 CUSTOMER INFO */}
      <div style={card}>
        <h3>Customer Information</h3>

        <div style={grid}>
          <div><b>Name:</b> {user.first_name} {user.last_name}</div>
          <div><b>Email:</b> {user.email}</div>
          <div><b>Phone:</b> {user.phone_number}</div>
          <div><b>Status:</b> {user.status}</div>
          <div><b>Role:</b> {user.role}</div>
          <div><b>Created:</b> {user.created_at}</div>
        </div>
      </div>

      {/* 🟢 PLAN DETAILS */}
      <div style={card}>
        <h3>Subscription Detail</h3>

        <div style={grid}>
          <div><b>Plan ID:</b> {user.planId}</div>
          <div><b>Activate:</b> {user.activateDate}</div>
          <div><b>Expiry:</b> {user.expiryDate}</div>
          <div><b>Group:</b> {user.group}</div>
        </div>
      </div>

      {/* 🟣 EXTRA INFO */}
      <div style={card}>
        <h3>Other Info</h3>

        <div style={grid}>
          <div><b>Country:</b> {user.country}</div>
          <div><b>State:</b> {user.state}</div>
          <div><b>City:</b> {user.city}</div>
          <div><b>Permission:</b> {user.permissionId}</div>
          <div><b>Broker Addon:</b> {user.broker_addon ? 'Yes' : 'No'}</div>
          <div><b>Active Broker:</b> {user.active_broker ? 'Yes' : 'No'}</div>
        </div>
      </div>

      {/* 🟠 HISTORY (Dummy for now) */}
      <div style={card}>
        <h3>Transaction History</h3>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Date</th>
              <th style={th}>Status</th>
              <th style={th}>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td}>--</td>
              <td style={td}>--</td>
              <td style={td}>--</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}

const card = {
  background: '#fff',
  padding: 16,
  borderRadius: 10,
  marginBottom: 16,
  border: '0.5px solid #eee'
};

const grid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 10,
  fontSize: 13
};

const th = {
  textAlign: 'left',
  padding: 8,
  borderBottom: '1px solid #eee'
};

const td = {
  padding: 8,
  borderBottom: '1px solid #f5f5f5'
};