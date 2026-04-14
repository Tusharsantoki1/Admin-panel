import React, { useState } from "react";
import { Tag, Space, Dropdown, App } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExperimentOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import CommonTableLayout from "../components/CommonTableLayout";
import { generateUsers } from "../data/mockData";

const StatusIcon = ({ value }) =>
  value ? (
    <CheckCircleFilled style={{ color: "#52c41a", fontSize: 14 }} />
  ) : (
    <CloseCircleFilled style={{ color: "#ff4d4f", fontSize: 14 }} />
  );

export default function UsersPage() {
  const { message, modal } = App.useApp();

  const [users, setUsers] = useState(generateUsers(100));

  const handleTrial = (user) => {
    if (user.status === "Active") return message.error("Trial already active");
    modal.confirm({
      title: "Start Trial",
      onOk: () => {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: "Active" } : u)),
        );
        message.success("7-day trial started");
      },
    });
  };

  const handleDelete = (id) => {
    modal.confirm({
      title: "Confirm Delete",
      okType: "danger",
      onOk: () => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        message.success("User deleted");
      },
    });
  };

  // ── Columns ──────────────────────────────────────────────
  const columns = [
    {
      title: "First Name",
      dataIndex: "first_name",
      width: 120,
      ellipsis: true,
    },
    { title: "Last Name", dataIndex: "last_name", width: 120, ellipsis: true },
    { title: "Email", dataIndex: "email", width: 220, ellipsis: true },
    { title: "Phone", dataIndex: "phone_number", width: 130 },
    {
      title: "Status",
      dataIndex: "status",
      width: 90,
      render: (s) => (
        <b style={{ color: s === "Active" ? "#52c41a" : "#ff4d4f" }}>{s}</b>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      width: 90,
      render: (r) => (
        <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
          {r}
        </Tag>
      ),
    },
    { title: "Country", dataIndex: "country", width: 110, ellipsis: true },
    { title: "State", dataIndex: "state", width: 110, ellipsis: true },
    { title: "City", dataIndex: "city", width: 110, ellipsis: true },
    { title: "Created", dataIndex: "created_at", width: 110 },
    { title: "Activate", dataIndex: "activateDate", width: 110 },
    { title: "Expiry", dataIndex: "expiryDate", width: 110 },
    { title: "Plan ID", dataIndex: "planId", width: 90 },
    {
      title: "Mob Ver",
      dataIndex: "isMobileVerified",
      width: 80,
      align: "center",
      render: (v) => <StatusIcon value={v} />,
    },
    {
      title: "Email Ver",
      dataIndex: "isEmailVerified",
      width: 80,
      align: "center",
      render: (v) => <StatusIcon value={v} />,
    },
    { title: "Perm ID", dataIndex: "permissionId", width: 100 },
    {
      title: "B. Addon",
      dataIndex: "broker_addon",
      width: 90,
      align: "center",
      render: (v) => (v ? "Yes" : "No"),
    },
    {
      title: "B. Active",
      dataIndex: "active_broker",
      width: 90,
      align: "center",
      render: (v) => (v ? "Yes" : "No"),
    },
    { title: "Group", dataIndex: "group", width: 100 },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Dropdown
            menu={{
              items: [
                {
                  key: "trial",
                  label: "Trial",
                  icon: <ExperimentOutlined />,
                  onClick: () => handleTrial(record),
                },
                {
                  key: "delete",
                  label: "Delete",
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => handleDelete(record.id),
                },
              ],
            }}
          >
            <MoreOutlined style={{ cursor: "pointer", fontSize: 16 }} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // ── Modal Form ────────────────────────────────────────────

  return (
    <CommonTableLayout
      // Table
      columns={columns}
      dataSource={users}
      rowKey="id"
      // Search
      searchFields={["first_name", "last_name", "email", "phone_number"]}
      searchPlaceholder="Search name, email, phone..."
      // Export
      exportFilename="users"
      exportHeaders={[
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Status",
        "Role",
        "Country",
        "City",
        "Created At",
      ]}
      exportMapper={(u) => [
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number,
        u.status,
        u.role,
        u.country,
        u.city,
        u.created_at,
      ]}
    />
  );
}
