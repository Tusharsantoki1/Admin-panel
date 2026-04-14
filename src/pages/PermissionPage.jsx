import React, { useState } from 'react';
import DataTable, { TableActionCell, TableCell } from '../components/DataTable';
import { Badge, MonoTag } from '../components/Badge';
import { useToast } from '../components/Toast';
import ActionMenu from '../components/ActionMenu';

function AddPermissionModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    module: 'Users',
    access: 'Read',
    assigned: '',
  });

  if (!open) return null;

  function handleSave() {
    if (!form.name) return;

    onSave({
      ...form,
      id: Date.now(),
      status: 'Active',
      created_at: new Date().toISOString().split('T')[0],
    });
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
        <h3 style={ms.title}>Create Permission</h3>

        <div style={ms.grid}>
          <div style={{ ...ms.group, gridColumn: 'span 2' }}>
            <label style={ms.label}>Permission Name *</label>
            {inp('name', 'users.edit')}
          </div>

          <div style={ms.group}>
            <label style={ms.label}>Module</label>
            {sel('module', ['Users', 'Coupons', 'Plans', 'Reports', 'Settings', 'Billing'])}
          </div>

          <div style={ms.group}>
            <label style={ms.label}>Access Level</label>
            {sel('access', ['Read', 'Write', 'Full'])}
          </div>

          <div style={{ ...ms.group, gridColumn: 'span 2' }}>
            <label style={ms.label}>Assigned To</label>
            {inp('assigned', 'Admin, Manager')}
          </div>
        </div>

        <div style={ms.footer}>
          <button style={ms.btnCancel} onClick={onClose}>Cancel</button>
          <button style={ms.btnSave} onClick={handleSave}>Create Permission</button>
        </div>
      </div>
    </div>
  );
}

export default function PermissionPage({ permissions, setPermissions }) {
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);

  function handleAdd(permission) {
    setPermissions(d => [permission, ...d]);
    setShowAdd(false);
    toast('Permission created', 'success');
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
        <TableCell><MonoTag>{row.name}</MonoTag></TableCell>
        <TableCell muted>{row.module}</TableCell>
        <TableCell><Badge label={row.access} /></TableCell>
        <TableCell small muted>{row.assigned}</TableCell>
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
        <div style={{ fontSize: 20, fontWeight: 600 }}>Permissions</div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
          Manage role-based access permissions
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <DataTable
          data={permissions}
          setData={setPermissions}
          columns={COLS}
          renderRow={renderRow}
          searchPlaceholder="Find permissions..."
          onAdd={() => setShowAdd(true)}
          addLabel="+ Create Permission"
          csvFilename="permissions_export.csv"
        />
      </div>

      <AddPermissionModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleAdd}
      />
    </div>
  );
}

const COLS = [
  { key: 'name', label: 'Name', width: '20%' },
  { key: 'module', label: 'Module', width: '12%' },
  { key: 'access', label: 'Access Level', width: '12%' },
  { key: 'assigned', label: 'Assigned To', width: '16%', sortable: false },
  { key: 'created_at', label: 'Created', width: '12%' },
  { key: 'status', label: 'Status', width: '10%' },
];

const ms = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.32)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: '#fff',
    borderRadius: 14,
    padding: 24,
    width: 460,
    border: '0.5px solid #e8e8e4',
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 16,
    color: '#1a1a18',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 20,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: '#666',
  },
  input: {
    padding: '8px 10px',
    border: '0.5px solid #e5e5e0',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    background: '#fff',
    color: '#1a1a18',
  },
  footer: {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
  },
  btnCancel: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '0.5px solid #ccc',
    background: '#fff',
  },
  btnSave: {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    background: '#534AB7',
    color: '#fff',
  },
};
