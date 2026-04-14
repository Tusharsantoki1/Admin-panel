import React, { useMemo, useState } from 'react';
import { sortData, filterData, exportCSV } from '../utils/helpers';
import ConfirmModal from './ConfirmModal';
import { useToast } from './Toast';

const ROWS_PER_PAGE = 20;
const CHECKBOX_COLUMN_WIDTH = 42;
const ACTIONS_COLUMN_WIDTH = 56;

export function TableCell({
  children,
  align = 'left',
  muted = false,
  small = false,
  strong = false,
  style = {},
  contentStyle = {},
}) {
  return (
    <td
      style={{
        ...s.td,
        textAlign: align,
        color: muted ? '#888' : '#1a1a18',
        fontSize: small ? 12 : 13,
        fontWeight: strong ? 600 : 400,
        ...style,
      }}
    >
      <div style={{ ...s.cellContent, ...contentStyle }}>
        {children}
      </div>
    </td>
  );
}

export function TableActionCell({ children, style = {} }) {
  return (
    <td style={{ ...s.actionTd, ...style }}>
      <div style={s.actionCellContent}>
        {children}
      </div>
    </td>
  );
}

export default function DataTable({
  data,
  setData,
  columns,
  renderRow,
  searchPlaceholder = 'Search...',
  filters = [],
  extraActions = null,
  onAdd,
  addLabel = '+ Add',
  csvFilename = 'export.csv',
}) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [filterVals, setFilterVals] = useState({});
  const [sort, setSort] = useState({ col: '', dir: 'asc' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    const fd = filterData(data, search, filterVals);
    return sortData(fd, sort.col, sort.dir);
  }, [data, search, filterVals, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  function handleSort(col) {
    setSort(s => (
      s.col === col
        ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { col, dir: 'asc' }
    ));
  }

  function toggleRow(id) {
    setSelected(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(checked) {
    setSelected(checked ? new Set(filtered.map(r => r.id)) : new Set());
  }

  function handleDelete(id) {
    setDeleteTarget(id);
  }

  function confirmDelete() {
    if (deleteTarget === 'bulk') {
      setData(d => d.filter(r => !selected.has(r.id)));
      toast(`${selected.size} records deleted`, 'success');
      setSelected(new Set());
    } else {
      setData(d => d.filter(r => r.id !== deleteTarget));
      setSelected(s => {
        const next = new Set(s);
        next.delete(deleteTarget);
        return next;
      });
      toast('Record deleted', 'success');
    }

    setDeleteTarget(null);
  }

  function handleBulkDelete() {
    if (selected.size) setDeleteTarget('bulk');
  }

  function handleExport() {
    const ok = exportCSV(filtered, csvFilename);
    toast(ok ? 'CSV exported' : 'No data to export', ok ? 'success' : 'error');
  }

  const allChecked = filtered.length > 0 && selected.size === filtered.length;
  const someChecked = selected.size > 0;

  return (
    <div style={s.root}>
      <div style={s.tbar}>
        <input
          style={s.searchInput}
          placeholder={searchPlaceholder}
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        {filters.map(f => (
          <select
            key={f.id}
            style={s.select}
            value={filterVals[f.id] || ''}
            onChange={e => {
              setFilterVals(v => ({ ...v, [f.id]: e.target.value }));
              setPage(1);
            }}
          >
            <option value="">{f.label}</option>
            {f.options.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}

        <div style={{ flex: 1 }} />
        {extraActions}
        <button style={s.btnOutline} onClick={handleExport}>Export CSV</button>
        {onAdd && <button style={s.btnPrimary} onClick={onAdd}>{addLabel}</button>}
      </div>

      {someChecked && (
        <div style={s.bulkBar}>
          <span style={{ fontWeight: 500 }}>{selected.size} selected</span>
          <button style={s.btnSm} onClick={handleBulkDelete}>Delete Selected</button>
          <button style={s.btnSmOutline} onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      <div style={s.tableWrap}>
        <div style={s.tableScroll}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.thCheck}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={el => {
                      if (el) el.indeterminate = someChecked && !allChecked;
                    }}
                    onChange={e => toggleAll(e.target.checked)}
                    style={s.checkbox}
                  />
                </th>

                {columns.map(col => (
                  <th
                    key={col.key}
                    style={{
                      ...s.th,
                      cursor: col.sortable !== false ? 'pointer' : 'default',
                    }}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div style={s.headerContent}>
                      <span style={s.headerLabel}>{col.label}</span>
                      {col.sortable !== false && (
                        <span
                          style={{
                            ...s.sortArrow,
                            ...(sort.col === col.key ? s.sortActive : {}),
                          }}
                        >
                          {sort.col === col.key ? (sort.dir === 'asc' ? '^' : 'v') : '<>'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}

                <th style={{ ...s.th, ...s.actionsTh }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} style={s.empty}>
                    No records found
                  </td>
                </tr>
              ) : (
                pageRows.map(row => (
                  <tr
                    key={row.id}
                    style={{
                      ...s.tr,
                      ...(selected.has(row.id) ? s.trSelected : {}),
                    }}
                  >
                    <td style={s.tdCheck}>
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        style={s.checkbox}
                      />
                    </td>

                    {renderRow(row, handleDelete, setData, toast)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={s.pagination}>
          <span style={s.pagInfo}>
            Showing {filtered.length === 0 ? 0 : (safePage - 1) * ROWS_PER_PAGE + 1}-
            {Math.min(safePage * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
          </span>

          <div style={s.pagBtns}>
            <button
              style={s.pagBtn}
              disabled={safePage === 1}
              onClick={() => setPage(p => p - 1)}
            >
              {'<'}
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) => (
                p === '...'
                  ? <span key={`ellipsis-${i}`} style={{ padding: '5px 4px', fontSize: 12 }}>...</span>
                  : (
                    <button
                      key={p}
                      style={{ ...s.pagBtn, ...(p === safePage ? s.pagBtnActive : {}) }}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
              ))}

            <button
              style={s.pagBtn}
              disabled={safePage === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              {'>'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Confirm Delete"
        message={
          deleteTarget === 'bulk'
            ? `Delete ${selected.size} selected records? This cannot be undone.`
            : 'Delete this record? This cannot be undone.'
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

const s = {
  root: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  tbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  searchInput: {
    padding: '8px 10px',
    border: '0.5px solid #ddd',
    borderRadius: 8,
    fontSize: 13,
    outline: 'none',
    minWidth: 240,
    flex: '1 1 240px',
    background: '#fff',
    color: '#1a1a18',
  },
  select: {
    padding: '8px 10px',
    border: '0.5px solid #ddd',
    borderRadius: 8,
    fontSize: 13,
    background: '#fff',
    color: '#1a1a18',
    outline: 'none',
    cursor: 'pointer',
  },
  btnPrimary: {
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
    border: 'none',
    background: '#534AB7',
    color: '#fff',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  btnOutline: {
    padding: '7px 14px',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
    border: '0.5px solid #ccc',
    background: '#fff',
    color: '#333',
    whiteSpace: 'nowrap',
  },
  bulkBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    background: '#EEEDFE',
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 13,
    color: '#3C3489',
  },
  btnSm: {
    padding: '5px 12px',
    borderRadius: 7,
    fontSize: 12,
    cursor: 'pointer',
    border: '0.5px solid #A32D2D',
    background: '#FCEBEB',
    color: '#A32D2D',
  },
  btnSmOutline: {
    padding: '5px 12px',
    borderRadius: 7,
    fontSize: 12,
    cursor: 'pointer',
    border: '0.5px solid #534AB7',
    background: 'transparent',
    color: '#534AB7',
  },
  tableWrap: {
    background: '#fff',
    border: '0.5px solid #e5e5e0',
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  tableScroll: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
  },
  table: {
    width: '100%',
    minWidth: '1400px',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  thCheck: {
    width: CHECKBOX_COLUMN_WIDTH,
    padding: '11px 14px',
    background: '#f9f9f7',
    borderBottom: '0.5px solid #e5e5e0',
    textAlign: 'center',
  },
  th: {
    padding: '11px 14px',
    textAlign: 'left',
    fontWeight: 500,
    fontSize: 12,
    color: '#666',
    borderBottom: '0.5px solid #e5e5e0',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    background: '#f9f9f7',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  headerLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actionsTh: {
    width: ACTIONS_COLUMN_WIDTH,
    textAlign: 'center',
  },
  sortArrow: {
    opacity: 0.4,
    fontSize: 10,
    flexShrink: 0,
  },
  sortActive: {
    opacity: 1,
    color: '#534AB7',
  },
  tr: {
    borderBottom: '0.5px solid #f0f0ee',
    transition: 'background .1s',
  },
  trSelected: {
    background: '#EEEDFE',
  },
  tdCheck: {
    padding: '10px 14px',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  td: {
    padding: '10px 14px',
    verticalAlign: 'middle',
  },
  actionTd: {
    padding: '10px 14px',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
  cellContent: {
    display: 'block',
    width: '100%',
  },
  actionCellContent: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  checkbox: {
    cursor: 'pointer',
    accentColor: '#534AB7',
    width: 14,
    height: 14,
  },
  empty: {
    padding: 16,
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderTop: '0.5px solid #e5e5e0',
  },
  pagInfo: {
    fontSize: 12,
    color: '#888',
  },
  pagBtns: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
  },
  pagBtn: {
    padding: '5px 10px',
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer',
    border: '0.5px solid #e5e5e0',
    background: '#fff',
    color: '#333',
    transition: 'all .15s',
  },
  pagBtnActive: {
    background: '#534AB7',
    color: '#fff',
    borderColor: '#534AB7',
  },
};
