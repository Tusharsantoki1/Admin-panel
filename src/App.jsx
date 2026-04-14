import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import { ToastProvider } from './components/Toast';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import CouponPage from './pages/CouponPage';
import PlanPage from './pages/PlanPage';
import PermissionPage from './pages/PermissionPage';
import History from './pages/paymentHistory';
import UserDetailsPage from './pages/UserDetailsPage';

import { generateUsers, generateCoupons, generatePlans, generatePermissions } from './data/mockData';

const initialUsers       = generateUsers(60);
const initialCoupons     = generateCoupons(30);
const initialPlans       = generatePlans(12);
const initialPermissions = generatePermissions(20);





export default function App() {
  const [users, setUsers] = useState(initialUsers);
  const [coupons, setCoupons] = useState(initialCoupons);
  const [plans, setPlans] = useState(initialPlans);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [globalSearch, setGlobalSearch] = useState('');
  const filteredUsers = users.filter(user =>
    Object.values(user).some(val =>
      String(val).toLowerCase().includes(globalSearch.toLowerCase())
    )
  );
  return (
    <ToastProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f5f5f3' }}>
        <Sidebar />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <Topbar onSearch={setGlobalSearch} results={filteredUsers} />

          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, padding: 0 }}>
            <Routes>
              <Route 
  path="/user/:id" 
  element={<UserDetailsPage users={users} />} 
/>
              <Route path="/" element={<DashboardPage users={users} />} />
              <Route path="/users" element={<UsersPage users={users} setUsers={setUsers} />} />
              <Route path="/coupon" element={<CouponPage coupons={coupons} setCoupons={setCoupons} />} />
              <Route path="/plan" element={<PlanPage plans={plans} setPlans={setPlans} />} />
              <Route path="/History" element={<History users={users} setUsers={setUsers} />} />
              <Route path="/permission" element={<PermissionPage permissions={permissions} setPermissions={setPermissions} />} />
              
            </Routes>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
