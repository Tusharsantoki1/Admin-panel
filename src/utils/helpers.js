import reactSecureStorage from 'react-secure-storage';

export const setLocalStorageData = (event, data) => {
  reactSecureStorage.setItem(event, data == undefined ? null : data);
};

export const getLocalStorageData = (key) => {
  return reactSecureStorage.getItem(key) || null;
};

export const removeLocalStorageData = (key) => {
  return reactSecureStorage.removeItem(key);
};

export const getUserEmail = () => {
  return reactSecureStorage.getItem('email') || '';
};

export const getUserData = () => {
  const access_token = reactSecureStorage.getItem('access_token');
  return {
    access_token: access_token ? access_token : '',
  };
};

export const noop = async () => {
  return new Promise(() => { });
};

export const toTitleCase = (value) => {
  if (!value) return "--";

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

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

export const StateList = [
  { value: 1, text: "Jammu And Kashmir" },
  { value: 2, text: "Himachal Pradesh" },
  { value: 3, text: "Punjab" },
  { value: 4, text: "Chandigarh" },
  { value: 5, text: "Uttarakhand" },
  { value: 6, text: "Haryana" },
  { value: 7, text: "Delhi" },
  { value: 8, text: "Rajasthan" },
  { value: 9, text: "Uttar Pradesh" },
  { value: 10, text: "Bihar" },
  { value: 11, text: "Sikkim" },
  { value: 12, text: "Arunachal Pradesh" },
  { value: 13, text: "Nagaland" },
  { value: 14, text: "Manipur" },
  { value: 15, text: "Mizoram" },
  { value: 16, text: "Tripura" },
  { value: 17, text: "Meghalaya" },
  { value: 18, text: "Assam" },
  { value: 19, text: "West Bengal" },
  { value: 20, text: "Jharkhand" },
  { value: 21, text: "Orissa" },
  { value: 22, text: "Chhattisgarh" },
  { value: 23, text: "Madhya Pradesh" },
  { value: 24, text: "Gujarat" },
  { value: 26, text: "Dadra And Nagar Haveli & Daman And Diu" },
  { value: 27, text: "Maharashtra" },
  { value: 29, text: "Karnataka" },
  { value: 30, text: "Goa" },
  { value: 31, text: "Lakshadweep" },
  { value: 32, text: "Kerala" },
  { value: 33, text: "Tamil Nadu" },
  { value: 34, text: "Puducherry" },
  { value: 35, text: "Andaman And Nicobar" },
  { value: 36, text: "Telangana" },
  { value: 37, text: "Andhra Pradesh" },
  { value: 38, text: "Ladakh" }
];

export const getStateName = (stateCode) => {
  if (stateCode === null || stateCode === undefined || stateCode === "") return "--";
  const found = StateList.find(
    (item) => String(item.value) === String(stateCode).trim() || item.text.toLowerCase() === String(stateCode).trim().toLowerCase()
  );
  return found ? found.text : String(stateCode);
};

