import React, { useState } from "react";
import {
  Layout,
  AutoComplete,
  Input,
  Badge,
  Button,
  Avatar,
  Flex,
  App,
  Space,
  Typography,
} from "antd";
import { SearchOutlined, BellOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Header } = Layout;

export default function Topbar({ onSearch, results = [] }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { message } = App.useApp();

  // Format results for AutoComplete dropdown
  const options = results.slice(0, 6).map((user) => ({
    value: user.id.toString(),
    label: (
      <Flex vertical style={{ padding: "2px 0" }}>
        <span style={{ fontWeight: 500, fontSize: 13 }}>
          {user.first_name} {user.last_name}
        </span>
        <span style={{ fontSize: 11, color: "#888" }}>
          {user.email} | {user.phone_number}
        </span>
      </Flex>
    ),
    user: user,
  }));

  const handleSelect = (val) => {
    navigate(`/user/${val}`);
    setQuery("");
  };

  const handleSearch = (value) => {
    setQuery(value);
    if (onSearch) onSearch(value);
  };

  return (
    <Header
      style={{
        background: "#fff",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #f0f0f0",
        height: "50px", // ✅ Strictly 50px height
        lineHeight: "50px", // ✅ Vertically centers text/content
        flexShrink: 0, // ✅ Prevents layout from squishing the header
      }}
    >
      {/* 1. LEFT SECTION */}
      <Space>
        <Title level={5} style={{ margin: 0 }}>
          Customer
        </Title>
        <Badge count={50} color="#1890ff" />
      </Space>

      {/* 2. CENTER SECTION (Search Bar) */}
      <div
        style={{
          flex: 2,
          height: "36px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AutoComplete
          options={options}
          style={{
            height: "36px",
            width: "100%",
            maxWidth: 400,
          }}
          onSelect={handleSelect}
          onSearch={handleSearch}
          value={query}
          notFoundContent={query ? "No users found" : null}
        >
          <Input
            prefix={
              <SearchOutlined style={{ height: "36px", marginRight: 6 }} />
            }
            placeholder="Search anything..."
            style={{
              height: "36px",
              borderRadius: 4,
              backgroundColor: "#fefefe",
              border: "1px solid #ccc",
            }}
            variant="filled"
          />
        </AutoComplete>
      </div>

      {/* 3. RIGHT SECTION (Notifications & Profile) */}
      <Flex flex={1} justify="flex-end" align="center" gap="middle">
        <Badge count={3} size="small" offset={[-2, 2]}>
          <Button
            type="text"
            shape="circle"
            icon={<BellOutlined style={{ fontSize: "16px", color: "#555" }} />}
            onClick={() => message.success("3 new notifications")}
          />
        </Badge>

        <Avatar
          size={30} // ✅ Slightly smaller avatar to fit 50px header
          style={{
            backgroundColor: "#534AB7",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          AD
        </Avatar>
      </Flex>
    </Header>
  );
}
