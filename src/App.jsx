import React, { useState } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConfigProvider, App as AntApp, Layout } from "antd";

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
  const [permissions, setPermissions] = useState(initialPermissions);

  const PrivateRoute = ({ access_token }) => {
    return access_token ? <Outlet /> : <Navigate to="/login" replace />;
  };

  const isLoginPage = location.pathname === "/login";

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <ConfigProvider theme={theme}>
        <AntApp>
          {isLoginPage ? (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          ) : (
            // 1. Set strict height instead of minHeight
            <Layout style={{ height: "100vh", overflow: "hidden" }}>
              <Sidebar />

              {/* 2. Add strict height to inner Layout */}
              <Layout style={{ height: "100vh" }}>
                <Topbar />

                <Content
                  style={{
                    height: "calc(100vh - 50px)", // 3. Subtract Topbar height
                    overflowY: "auto", // 4. Let only this section scroll
                    background: "#fdfdfd",
                  }}
                >
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<PrivateRoute access_token={access_token} />}>
                      <Route path="/user/:id" element={<UserDetailsPage />} />
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/coupon" element={<CouponPage />} />
                      <Route path="/plan" element={<PlanPage />} />
                      <Route path="/History" element={<History />} />
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