import React, { useState, useEffect } from "react";
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
  Spin,
} from "antd";
import { SearchOutlined, BellOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useUsersList } from "../hooks/useUsersList"; // Import your hook
import { toTitleCase } from "../utils/helpers";
import { useTitleCount } from "../hooks/useTitleCount";

const { Title } = Typography;
const { Header } = Layout;

export default function Topbar() {
  const { data: title } = useTitleCount();
  const [query, setQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();
  const { message } = App.useApp();

  // 1. Handle Debouncing (Logic from your UsersPage)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(query.trim());
    }, 600); // 600ms delay for global search

    return () => clearTimeout(timer);
  }, [query]);

  // 2. Fetch Data using the hook (Using the same logic as UsersPage)
  const { data: usersResponse, isFetching } = useUsersList({
    page: 1,
    limit: 25, // Limit results for the dropdown
    ...(debouncedSearch && { filters: { email: debouncedSearch } }),
    sort: "desc",
  });

  const users = usersResponse?.data || [];

  // 3. Format results for AutoComplete dropdown
  const options = users.map((user) => ({
    value: user.id.toString(),
    label: (
      <Flex align="center" style={{ padding: "4px 0", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 600, fontSize: 12, color: '#111' }}>
          {toTitleCase(user.first_name)} {toTitleCase(user.last_name)}
        </span>
        <span style={{ fontSize: 11, color: "#888", marginRight: 8 }}>
          {user.email} • {user.phone_number || "No Phone"}
        </span>
      </Flex>
    ),
  }));

  const handleSelect = (val) => {
    navigate(`/user/${val}`, { replace: true, state: { id: val } });
    setQuery("");
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
        height: "50px",
        lineHeight: "50px",
        flexShrink: 0,
      }}
    >
      {/* 1. LEFT SECTION */}
      <Space style={{ width: '200px', whiteSpace: 'nowrap' }}>
        <Title level={5} style={{ margin: 0 }}>
          {title?.title}
        </Title>
        {title?.count ? <Badge count={title?.count || 0} overflowCount={999} color="#1890ff" /> : null}
      </Space>

      {/* 2. CENTER SECTION (Integrated Search) */}
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
          onSearch={(val) => setQuery(val)}
          value={query}
          notFoundContent={isFetching ? <Spin size="small" style={{ padding: 10 }} /> : "No users found"}
        >
          <Input
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Search users by email..."
            allowClear
            style={{
              height: "34px",
            }}
          />
        </AutoComplete>
      </div>

      {/* 3. RIGHT SECTION */}
      <Flex flex={1} justify="flex-end" align="center" gap="middle">
        <Badge count={3} size="small" offset={[-2, 2]}>
          <Button
            type="text"
            shape="circle"
            icon={<BellOutlined style={{ fontSize: "18px", color: "#555" }} />}
            onClick={() => message.success("Notifications coming soon")}
          />
        </Badge>

        <Avatar
          size={32}
          style={{
            backgroundColor: "#534AB7",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          AD
        </Avatar>
      </Flex>
    </Header>
  );
}