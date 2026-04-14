import React, { useState } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConfigProvider, App as AntApp, Layout } from "antd"; // 🔥 Added Antd

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import CouponPage from "./pages/CouponPage";
import PlanPage from "./pages/PlanPage";
import PermissionPage from "./pages/PermissionPage";
import History from "./pages/paymentHistory";
import UserDetailsPage from "./pages/UserDetailsPage";

import {
  generateUsers,
  generateCoupons,
  generatePlans,
  generatePermissions,
} from "./data/mockData";
import { theme } from "./utils/Theme";
import { getUserData } from "./utils/helpers";
import Login from "./pages/Login";

const initialUsers = generateUsers(60);
const initialCoupons = generateCoupons(30);
const initialPlans = generatePlans(12);
const initialPermissions = generatePermissions(20);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30 * 60 * 1000, retry: 0, gcTime: 30 * 60 * 1000 },
  },
});

const { Content } = Layout;

export default function App() {
  const location = useLocation();
  const { access_token } = getUserData();
  const [users, setUsers] = useState(initialUsers);
  const [coupons, setCoupons] = useState(initialCoupons);
  const [plans, setPlans] = useState(initialPlans);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [globalSearch, setGlobalSearch] = useState("");

  const PrivateRoute = ({ access_token }) => {
    return access_token ? <Outlet /> : <Navigate to="/login" replace />;
  };

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((val) =>
      String(val).toLowerCase().includes(globalSearch.toLowerCase()),
    ),
  );

  const isLoginPage = location.pathname === "/login";

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      {/* ConfigProvider allows us to customize the global Ant Design theme */}
      <ConfigProvider theme={theme}>
        <AntApp>
          {/* AntApp provides global Context for Messages/Modals/Notifications */}
          {isLoginPage ? (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          ) : (
            <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
              <Sidebar />

              <Layout>
                <Topbar onSearch={setGlobalSearch} results={filteredUsers} />

                <Content
                  style={{
                    overflow: "auto",
                    background: "#fdfdfd",
                  }}
                >
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<PrivateRoute access_token={access_token} />}>
                      <Route
                        path="/user/:id"
                        element={<UserDetailsPage users={users} />}
                      />
                      <Route path="/" element={<DashboardPage users={users} />} />
                      <Route
                        path="/users"
                        element={<UsersPage users={users} setUsers={setUsers} />}
                      />
                      <Route
                        path="/coupon"
                        element={
                          <CouponPage coupons={coupons} setCoupons={setCoupons} />
                        }
                      />
                      <Route
                        path="/plan"
                        element={<PlanPage plans={plans} setPlans={setPlans} />}
                      />
                      <Route
                        path="/History"
                        element={<History users={users} setUsers={setUsers} />}
                      />
                      <Route
                        path="/permission"
                        element={
                          <PermissionPage
                            permissions={permissions}
                            setPermissions={setPermissions}
                          />
                        }
                      />
                    </Route>
                  </Routes>
                </Content>
              </Layout>
            </Layout>
          )}
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
