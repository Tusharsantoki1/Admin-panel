import React, { useEffect, useState } from 'react';
import DataTable, { TableActionCell, TableCell } from '../components/DataTable';
import { Badge, MonoTag } from '../components/Badge';
import { useToast } from '../components/Toast';
import ActionMenu from '../components/ActionMenu';

function AddCouponModal({ open, onClose, onSave, initialData }) {
  const emptyForm = {
    code: '',
    discount: '',
    type: 'Percentage',
    max_uses: '',
    expiry: '',
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm(emptyForm);
  }, [initialData, open]);

  if (!open) return null;

  function handleSave() {
    if (!form.code) return;

    onSave({
      ...form,
      id: form.id || Date.now(),
      discount: +form.discount || 10,
      max_uses: +form.max_uses || 100,
      uses: form.uses ?? 0,
      status: form.status || 'Active',
      created_at: form.created_at || new Date().toISOString().split('T')[0],
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
        <h3 style={ms.title}>{initialData ? 'Edit Coupon' : 'Create Coupon'}</h3>

        <div style={ms.grid}>
          <div style={ms.group}>
            <label style={ms.label}>Coupon Code *</label>
            {inp('code', 'SAVE20')}
          </div>

          <div style={ms.group}>
            <label style={ms.label}>Type</label>
            <select
              style={ms.input}
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              <option>Percentage</option>
              <option>Fixed</option>
            </select>
          </div>

          <div style={ms.group}>
            <label style={ms.label}>Discount</label>
            {inp('discount', '20', 'number')}
          </div>

          <div style={ms.group}>
            <label style={ms.label}>Max Uses</label>
            {inp('max_uses', '100', 'number')}
          </div>

          <div style={{ ...ms.group, gridColumn: 'span 2' }}>
            <label style={ms.label}>Expiry Date</label>
            {inp('expiry', '', 'date')}
          </div>
        </div>

        <div style={ms.footer}>
          <button style={ms.btnCancel} onClick={onClose}>Cancel</button>
          <button style={ms.btnSave} onClick={handleSave}>
            {initialData ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CouponPage({ coupons, setCoupons }) {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  function handleSave(coupon) {
    setCoupons(prev => {
      const exists = prev.find(c => c.id === coupon.id);
      return exists ? prev.map(c => (c.id === coupon.id ? coupon : c)) : [coupon, ...prev];
    });

    setShowModal(false);
    setEditingCoupon(null);
    toast(editingCoupon ? 'Coupon updated' : 'Coupon created', 'success');
  }

  function renderRow(row, onDelete, setData) {
    function toggleStatus() {
      setData(d => (
        d.map(r => (
          r.id === row.id
            ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' }
            : r
        ))
      ));
      toast('Status updated', 'success');
    }

    return (
      <>
        <TableCell><MonoTag>{row.code}</MonoTag></TableCell>
        <TableCell strong>
          {row.type === 'Percentage' ? `${row.discount}%` : `$${row.discount}`}
        </TableCell>
        <TableCell small muted>{row.type}</TableCell>
        <TableCell>
          <div onClick={toggleStatus} style={{ cursor: 'pointer' }}>
            <Badge label={row.status} />
          </div>
        </TableCell>
        <TableCell small muted>{row.uses} / {row.max_uses}</TableCell>
        <TableCell small muted>{row.expiry}</TableCell>
        <TableCell small muted>{row.created_at}</TableCell>
        <TableActionCell>
          <ActionMenu
            onEdit={() => {
              setEditingCoupon(row);
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
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Coupons</div>
        <div style={{ fontSize: 13, color: '#888' }}>Manage discount coupons</div>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <DataTable
          data={coupons}
          setData={setCoupons}
          columns={COLS}
          renderRow={renderRow}
          searchPlaceholder="Find coupons..."
          filters={[
            {
              id: 'status',
              label: 'All Status',
              options: ['Active', 'Inactive'].map(v => ({ value: v, label: v })),
            },
          ]}
          onAdd={() => {
            setEditingCoupon(null);
            setShowModal(true);
          }}
          addLabel="+ Create Coupon"
        />
      </div>

      <AddCouponModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        initialData={editingCoupon}
      />
    </div>
  );
}

const COLS = [
  { key: 'code', label: 'Code', width: '16%' },
  { key: 'discount', label: 'Discount', width: '12%' },
  { key: 'type', label: 'Type', width: '10%' },
  { key: 'status', label: 'Status', width: '10%' },
  { key: 'uses', label: 'Uses / Max', width: '12%', sortable: false },
  { key: 'expiry', label: 'Expiry', width: '12%' },
  { key: 'created_at', label: 'Created', width: '12%' },
];

const ms = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.32)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: '#fff', borderRadius: 14, padding: 24, width: 460 },
  title: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 },
  group: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, color: '#666' },
  input: { padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8 },
  footer: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  btnCancel: { padding: '8px 16px' },
  btnSave: { padding: '8px 16px', background: '#534AB7', color: '#fff' },
};
