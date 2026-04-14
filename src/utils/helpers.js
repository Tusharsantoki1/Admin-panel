export function exportCSV(data, filename = 'export.csv') {
  if (!data.length) return false;
  const keys = Object.keys(data[0]);
  const csv = [
    keys.join(','),
    ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))
  ].join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = filename;
  a.click();
  return true;
}

export function sortData(data, col, dir) {
  if (!col) return data;
  return [...data].sort((a, b) => {
    const av = a[col] ?? '', bv = b[col] ?? '';
    if (typeof av === 'number') return dir === 'asc' ? av - bv : bv - av;
    return dir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });
}

export function filterData(data, search, filters = {}) {
  return data.filter(r => {
    const matchSearch = !search ||
      Object.values(r).join(' ').toLowerCase().includes(search.toLowerCase());
    const matchFilters = Object.entries(filters).every(([k, v]) => !v || r[k] === v);
    return matchSearch && matchFilters;
  });
}
