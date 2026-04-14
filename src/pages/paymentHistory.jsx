import React, { useEffect, useState } from 'react';
import DataTable, { TableActionCell, TableCell } from '../components/DataTable';
import { Badge, BoolTag } from '../components/Badge';
import { useToast } from '../components/Toast';
import ActionMenu from '../components/ActionMenu';

function AddUserModal({ open, onClose, onSave, initialData }) {
  const emptyForm = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    country: '',
    state: '',
    city: '',
    role: 'User',
    status: 'Active',
    planId: 'PLN-001',
    group: 'Group A',
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm(emptyForm);
  }, [initialData, open]);

  if (!open) return null;

  function handleSave() {
    if (!form.first_name || !form.email) return;

    onSave({
      ...form,
      id: form.id || Date.now(),
      isMobileVerified: form.isMobileVerified ?? false,
      isEmailVerified: form.isEmailVerified ?? false,
      created_at: form.created_at || new Date().toISOString().split('T')[0],
    });

    setForm(emptyForm);
  }

  const inp = (key, placeholder) => (
    <input
      style={ms.input}
      placeholder={placeholder}
      value={form[key]}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
    />
  );

  const sel = (key, opts) => (
    <select
      style={ms.input}
      value={form[key]}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
    >
      {opts.map(o => <option key={o}>{o}</option>)}
    </select>
  );

  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.modal} onClick={e => e.stopPropagation()}>
        <h3 style={ms.title}>{initialData ? 'Edit User' : 'Add User'}</h3>

        <div style={ms.grid}>
          <div style={ms.group}>
            <label style={ms.label}>First Name *</label>
            {inp('first_name', 'First Name')}
          </div>
          <div style={ms.group}>
            <label style={ms.label}>Last Name</label>
            {inp('last_name', 'Last Name')}
          </div>
          <div style={ms.group}>
            <label style={ms.label}>Email *</label>
            {inp('email', 'Email')}
          </div>
          <div style={ms.group}>
            <label style={ms.label}>Phone</label>
            {inp('phone_number', 'Phone')}
          </div>
          <div style={ms.group}>
            <label style={ms.label}>Country</label>
            {inp('country', 'Country')}
          </div>
          <div style={ms.group}>
            <label style={ms.label}>State</label>
            {inp('state', 'State')}
          </div>
          <div style={ms.group}>
            <label style={ms.label}>City</label>
            {inp('city', 'City')}
          </div>
          <div style={ms.group}>
            <label style={ms.label}>Role</label>
            {sel('role', ['User', 'Admin', 'Manager'])}
          </div>
          <div style={ms.group}>
            <label style={ms.label}>Status</label>
            {sel('status', ['Active', 'Inactive'])}
          </div>
          <div style={ms.group}>
            <label style={ms.label}>Plan</label>
            {sel('planId', ['PLN-001', 'PLN-002'])}
          </div>
          <div style={ms.group}>
            <label style={ms.label}>Group</label>
            {sel('group', ['Group A', 'Group B'])}
          </div>
        </div>

        <div style={ms.footer}>
          <button style={ms.btnCancel} onClick={onClose}>Cancel</button>
          <button style={ms.btnSave} onClick={handleSave}>
            {initialData ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function History({ users, setUsers }) {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  function handleSave(user) {
    setUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      return exists ? prev.map(u => (u.id === user.id ? user : u)) : [user, ...prev];
    });

    setShowModal(false);
    setEditingUser(null);
    toast(editingUser ? 'User updated' : 'User added', 'success');
  }

  function renderRow(row, onDelete) {
    return (
      <>
        <TableCell>{row.first_name}</TableCell>
        <TableCell>{row.last_name}</TableCell>
        <TableCell muted>{row.email}</TableCell>
        <TableCell muted>{row.phone_number}</TableCell>
        <TableCell>{row.country}</TableCell>
        <TableCell>{row.state}</TableCell>
        <TableCell>{row.city}</TableCell>
        <TableCell><Badge label={row.status} /></TableCell>
        <TableCell small muted>{row.created_at}</TableCell>
        <TableCell small muted>{row.activateDate}</TableCell>
        <TableCell small muted>{row.expiryDate}</TableCell>
        <TableCell>{row.planId}</TableCell>
        <TableCell><BoolTag value={row.isMobileVerified} /></TableCell>
        <TableCell><BoolTag value={row.isEmailVerified} /></TableCell>
        <TableCell><Badge label={row.role} /></TableCell>
        <TableCell>{row.permissionId}</TableCell>
        <TableCell>{row.broker_addon}</TableCell>
        <TableCell>{row.active_broker}</TableCell>
        <TableCell>{row.group}</TableCell>
        <TableActionCell>
          <ActionMenu
            onEdit={() => {
              setEditingUser(row);
              setShowModal(true);
            }}
            onDelete={() => onDelete(row.id)}
          />
        </TableActionCell>
      </>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <DataTable
        data={users}
        setData={setUsers}
        columns={COLUMNS}
        renderRow={renderRow}
        onAdd={() => {
          setEditingUser(null);
          setShowModal(true);
        }}
      />

      <AddUserModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        initialData={editingUser}
      />
    </div>
  );
}

const COLUMNS = [
  { key: 'first_name', label: 'First Name', width: '5%' },
  { key: 'last_name', label: 'Last Name', width: '5%' },
  { key: 'email', label: 'Email', width: '7%' },
  { key: 'phone_number', label: 'Phone', width: '6%' },
  { key: 'country', label: 'Country', width: '4%' },
  { key: 'state', label: 'State', width: '4%' },
  { key: 'city', label: 'City', width: '4%' },
  { key: 'status', label: 'Status', width: '4%' },
  { key: 'created_at', label: 'Created', width: '5%' },
  { key: 'activateDate', label: 'Activate Date', width: '5%' },
  { key: 'expiryDate', label: 'Expiry Date', width: '5%' },
  { key: 'planId', label: 'Plan', width: '4%' },
  { key: 'isMobileVerified', label: 'Mobile Verified', width: '4%' },
  { key: 'isEmailVerified', label: 'Email Verified', width: '4%' },
  { key: 'role', label: 'Role', width: '4%' },
  { key: 'permissionId', label: 'Permission', width: '4%' },
  { key: 'broker_addon', label: 'Broker Addon', width: '4%' },
  { key: 'active_broker', label: 'Active Broker', width: '4%' },
  { key: 'group', label: 'Group', width: '4%' },
];

const ms = {
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: 500,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.32)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: '#fff',
    borderRadius: 14,
    padding: 24,
    width: 520,
  },
  title: { fontSize: 16, marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  input: { padding: 8, borderRadius: 8, border: '1px solid #ddd' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 8 },
  btnCancel: { padding: '8px 16px' },
  btnSave: { padding: '8px 16px', background: '#534AB7', color: '#fff' },
};
