import React, { useState } from 'react';
import DataTable, { TableActionCell, TableCell } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { useToast } from '../components/Toast';
import ActionMenu from '../components/ActionMenu';

function AddPlanModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', price: '', billing: 'Monthly', features: '' });

  if (!open) return null;

  function handleSave() {
    if (!form.name) return;

    onSave({
      ...form,
      id: Date.now(),
      price: +form.price || 0,
      users: 0,
      status: 'Active',
      created_at: new Date().toISOString().split('T')[0],
    });
  }

  const inp = (key, placeholder, type = 'text') => (
    <input
      style={ms.input}
      type={type}
      placeholder={placeholder}
      value={form[key]}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
    />
  );

  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.modal} onClick={e => e.stopPropagation()}>
        <h3 style={ms.title}>Create Plan</h3>
        <div style={ms.grid}>
          <div style={ms.group}>
            <label style={ms.label}>Plan Name *</label>
            {inp('name', 'Pro Plan')}
          </div>
          <div style={ms.group}>
            <label style={ms.label}>Price ($)</label>
            {inp('price', '29.99', 'number')}
          </div>
          <div style={ms.group}>
            <label style={ms.label}>Billing Cycle</label>
            <select
              style={ms.input}
              value={form.billing}
              onChange={e => setForm(f => ({ ...f, billing: e.target.value }))}
            >
              <option>Monthly</option>
              <option>Annual</option>
              <option>Lifetime</option>
            </select>
          </div>
          <div style={{ ...ms.group, gridColumn: 'span 2' }}>
            <label style={ms.label}>Features</label>
            {inp('features', 'Unlimited access, Priority support')}
          </div>
        </div>
        <div style={ms.footer}>
          <button style={ms.btnCancel} onClick={onClose}>Cancel</button>
          <button style={ms.btnSave} onClick={handleSave}>Create Plan</button>
        </div>
      </div>
    </div>
  );
}

export default function PlanPage({ plans, setPlans }) {
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);

  function handleAdd(plan) {
    setPlans(d => [plan, ...d]);
    setShowAdd(false);
    toast('Plan created', 'success');
  }

  function renderRow(row, onDelete, setData, rowToast) {
    function toggleStatus() {
      setData(d => (
        d.map(r => (
          r.id === row.id
            ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' }
            : r
        ))
      ));
      rowToast('Status updated', 'success');
    }

    return (
      <>
        <TableCell strong>{row.name}</TableCell>
        <TableCell strong>${row.price}</TableCell>
        <TableCell><Badge label={row.billing} /></TableCell>
        <TableCell small muted>{row.features}</TableCell>
        <TableCell>{row.users.toLocaleString()}</TableCell>
        <TableCell small muted>{row.created_at}</TableCell>
        <TableCell>
          <div onClick={toggleStatus} style={{ cursor: 'pointer' }}>
            <Badge label={row.status} />
          </div>
        </TableCell>
        <TableActionCell>
          <ActionMenu
            onEdit={() => rowToast('Edit mode', 'success')}
            onDelete={() => onDelete(row.id)}
          />
        </TableActionCell>
      </>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Plans</div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
          Manage subscription plans
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <DataTable
          data={plans}
          setData={setPlans}
          columns={COLS}
          renderRow={renderRow}
          searchPlaceholder="Find plans..."
          onAdd={() => setShowAdd(true)}
          addLabel="+ Create Plan"
          csvFilename="plans_export.csv"
        />
      </div>

      <AddPlanModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAdd}
      />
    </div>
  );
}

const COLS = [
  { key: 'name', label: 'Name', width: '14%' },
  { key: 'price', label: 'Price', width: '10%' },
  { key: 'billing', label: 'Billing', width: '12%' },
  { key: 'features', label: 'Features', width: '18%', sortable: false },
  { key: 'users', label: 'Users', width: '8%' },
  { key: 'created_at', label: 'Created', width: '12%' },
  { key: 'status', label: 'Status', width: '10%' },
];

const ms = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.32)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: 14, padding: 24, width: 460, border: '0.5px solid #e8e8e4' },
  title: { fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1a1a18' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 },
  group: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, fontWeight: 500, color: '#666' },
  input: { padding: '8px 10px', border: '0.5px solid #e5e5e0', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', color: '#1a1a18', fontFamily: 'inherit' },
  footer: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  btnCancel: { padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: '0.5px solid #ccc', background: '#fff', color: '#333' },
  btnSave: { padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', border: 'none', background: '#534AB7', color: '#fff', fontWeight: 500 },
};
