import React, { useEffect, useState, useCallback } from 'react';
import DataTable, { TableActionCell, TableCell } from '../components/DataTable';
import { Badge, BoolTag } from '../components/Badge';
import { useToast } from '../components/Toast';
import ActionMenu from '../components/ActionMenu';
import ConfirmModal from '../components/ConfirmModal';
import BASE_URL from '../api/config';

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


export default function UsersPage() {
  const toast = useToast();

  // ✅ Data states
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0); // total count from backend

  // ✅ API payload states
  const [page, setPage] = useState(1);
  const limit = 20; // 20 users per page, API call on every page change
  const [emailFilter, setEmailFilter] = useState('');

  // ✅ UI states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [trialUser, setTrialUser] = useState(null);

  const totalPages = Math.ceil(total / limit);

  // ✅ Fetch users from POST API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        page,
        limit,
        filter: emailFilter.trim() ? { email: emailFilter.trim() } : {},
      };

      const res = await fetch(`${BASE_URL}/users/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setUsers(data.users ?? data);
      setTotal(data.total ?? 0); // backend must return total count

    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, emailFilter]);

  // ✅ Re-fetch on page or filter change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ✅ Debounce email — reset to page 1 on new search
  const [emailInput, setEmailInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // reset to page 1 when filter changes
      setEmailFilter(emailInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [emailInput]);

  // ✅ Trial handler
  function handleTrialConfirm() {
    const today = new Date();
    const activateDate = today.toISOString().split('T')[0];
    const expiry = new Date();
    expiry.setDate(today.getDate() + 7);
    const expiryDate = expiry.toISOString().split('T')[0];

    setUsers(prev =>
      prev.map(u =>
        u.id === trialUser.id
          ? { ...u, status: 'Active', activateDate, expiryDate }
          : u
      )
    );

    setTrialUser(null);
    toast('7-day trial started', 'success');
  }

  // ✅ Save handler (add / edit)
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
            extraActions={[
              {
                label: 'Trial Period',
                onClick: () => {
                  if (row.status === 'Active') {
                    toast('Trial already active', 'error');
                    return;
                  }
                  setTrialUser(row);
                }
              }
            ]}
          />
        </TableActionCell>
      </>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

      {/* ✅ Email filter bar */}
      <div style={fs.bar}>
        <div style={fs.inputWrap}>
          <span style={fs.icon}>🔍</span>
          <input
            style={fs.input}
            placeholder="Search by email..."
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
          />
          {emailInput && (
            <button style={fs.clear} onClick={() => setEmailInput('')}>✕</button>
          )}
        </div>

        {/* shows what filter is active */}
        {emailFilter && (
          <div style={fs.tag}>
            Filtering: <strong>{emailFilter}</strong>
          </div>
        )}

        {loading && <div style={fs.loading}>Loading...</div>}
      </div>

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

      {/* ✅ Pagination bar */}
      {totalPages > 1 && (
        <div style={pg.bar}>
          <span style={pg.info}>
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            <span style={{ color: '#bbb', marginLeft: 6 }}>({total} total users)</span>
          </span>

          <div style={pg.btns}>
            <button
              style={{ ...pg.btn, opacity: page === 1 ? 0.4 : 1 }}
              disabled={page === 1}
              onClick={() => setPage(1)}
            >«</button>

            <button
              style={{ ...pg.btn, opacity: page === 1 ? 0.4 : 1 }}
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >Prev</button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...'
                  ? <span key={`dot-${i}`} style={pg.dots}>…</span>
                  : <button
                      key={p}
                      style={{ ...pg.btn, ...(p === page ? pg.active : {}) }}
                      onClick={() => setPage(p)}
                    >{p}</button>
              )
            }

            <button
              style={{ ...pg.btn, opacity: page === totalPages ? 0.4 : 1 }}
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >Next</button>

            <button
              style={{ ...pg.btn, opacity: page === totalPages ? 0.4 : 1 }}
              disabled={page === totalPages}
              onClick={() => setPage(totalPages)}
            >»</button>
          </div>
        </div>
      )}

      <AddUserModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        initialData={editingUser}
      />

      <ConfirmModal
        open={trialUser !== null}
        title="Start Trial"
        message={
          trialUser
            ? `Start trial for ${trialUser.first_name} ${trialUser.last_name}?`
            : ''
        }
        onConfirm={handleTrialConfirm}
        onCancel={() => setTrialUser(null)}
        danger={false}
        confirmText="Start Trial"
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

// Pagination styles
const pg = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 4px',
    marginTop: 8,
    borderTop: '0.5px solid #e8e8e4',
  },
  info: { fontSize: 12, color: '#888' },
  btns: { display: 'flex', alignItems: 'center', gap: 4 },
  btn: {
    padding: '5px 10px',
    fontSize: 12,
    border: '1px solid #e0e0e0',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
    color: '#444',
    fontWeight: 500,
  },
  active: {
    background: '#534AB7',
    color: '#fff',
    border: '1px solid #534AB7',
  },
  dots: { fontSize: 12, color: '#bbb', padding: '0 4px' },
};

// Filter bar styles
const fs = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0',
    marginBottom: 8,
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '6px 10px',
    gap: 6,
    background: '#fff',
    width: 280,
  },
  icon: { fontSize: 13, color: '#999' },
  input: {
    border: 'none',
    outline: 'none',
    fontSize: 13,
    flex: 1,
    color: '#333',
  },
  clear: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#999',
    fontSize: 12,
    padding: 0,
  },
  tag: {
    fontSize: 12,
    color: '#534AB7',
    background: '#EEEDFE',
    padding: '4px 10px',
    borderRadius: 6,
  },
  loading: {
    fontSize: 12,
    color: '#999',
  },
};

// Modal styles
const ms = {
  group: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, color: '#666', fontWeight: 500 },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,.32)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: { background: '#fff', borderRadius: 14, padding: 24, width: 520 },
  title: { fontSize: 16, marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  input: { padding: 8, borderRadius: 8, border: '1px solid #ddd' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
  btnCancel: { padding: '8px 16px' },
  btnSave: { padding: '8px 16px', background: '#534AB7', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' },
};