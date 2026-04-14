import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Flex, Typography, Button } from "antd";
import {
  AppstoreOutlined,
  UserOutlined,
  TagOutlined,
  CreditCardOutlined,
  LockOutlined,
  HistoryOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;
const { Text } = Typography;

const NAV_ITEMS = [
  {
    key: "/",
    icon: <AppstoreOutlined />,
    label: <Link to="/">Dashboard</Link>,
  },
  {
    key: "/users",
    icon: <UserOutlined />,
    label: <Link to="/users">Users</Link>,
  },
  {
    key: "/coupon",
    icon: <TagOutlined />,
    label: <Link to="/coupon">Coupon</Link>,
  },
  {
    key: "/plan",
    icon: <CreditCardOutlined />,
    label: <Link to="/plan">Plan</Link>,
  },
  // {
  //   key: "/permission",
  //   icon: <LockOutlined />,
  //   label: <Link to="/permission">Permission</Link>,
  // },
  {
    key: "/History",
    icon: <HistoryOutlined />,
    label: <Link to="/History">History</Link>,
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider
      width={180}
      theme="light"
      collapsible
      collapsed={collapsed}
      trigger={null} // 🔥 Hides the default ugly bottom bar
      style={{
        borderRight: "1px solid #f0f0f0",
        minHeight: "100vh",
        position: "relative", // Required for the absolute button to work
      }}
    >
      {/* Logo Section */}
      <Flex
        align="center"
        justify={collapsed ? "center" : "flex-start"}
        gap="small"
        style={{
          height: "50px", // Matches your Topbar
          padding: collapsed ? "0" : "0 16px",
          borderBottom: "1px solid #f0f0f0",
          position: "relative",
        }}
      >
        <Avatar
          shape="square"
          style={{
            backgroundColor: "#534AB7",
            fontWeight: "bold",
            flexShrink: 0,
          }}
        >
          A
        </Avatar>

        {!collapsed && (
          <Text strong style={{ fontSize: "16px", whiteSpace: "nowrap" }}>
            AdminPro
          </Text>
        )}
      </Flex>

      {/* 🔥 Professional Overlapping Toggle Button */}
      <Button
        shape="circle"
        size="small"
        onClick={() => setCollapsed(!collapsed)}
        icon={
          collapsed ? (
            <RightOutlined style={{ fontSize: 10 }} />
          ) : (
            <LeftOutlined style={{ fontSize: 10 }} />
          )
        }
        style={{
          position: "absolute",
          top: 13, // Vertically centers it in the 50px header area
          right: -12, // Pulls it exactly half-way outside the sidebar border
          zIndex: 1000, // Ensures it sits above the main content area
          border: "1px solid #ccc",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          background: "#fff",
          color: "#888",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />

      {/* Navigation Menu */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={NAV_ITEMS}
        style={{ borderRight: 0, padding: "10px 0" }}
      />
    </Sider>
  );
}
