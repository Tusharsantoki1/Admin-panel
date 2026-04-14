import React from "react";
import { Tag, Dropdown, App } from "antd";
import {
  DeleteOutlined,
  MoreOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import CommonTableLayout from "../components/CommonTableLayout";

export default function History({ users, setUsers }) {
  const { message, modal } = App.useApp();

  const handleDelete = (id) => {
    modal.confirm({
      title: "Confirm Delete",
      okType: "danger",
      onOk: () => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        message.success("Record deleted");
      },
    });
  };

  const StatusIcon = ({ value }) =>
    value ? (
      <CheckCircleFilled style={{ color: "#52c41a", fontSize: 14 }} />
    ) : (
      <CloseCircleFilled style={{ color: "#ff4d4f", fontSize: 14 }} />
    );

  const columns = [
    {
      title: "First Name",
      dataIndex: "first_name",
      width: 120,
      ellipsis: true,
    },
    { title: "Last Name", dataIndex: "last_name", width: 120, ellipsis: true },
    {
      title: "Email",
      dataIndex: "email",
      width: 200,
      ellipsis: true,
      render: (v) => <span style={{ color: "#888" }}>{v}</span>,
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      width: 130,
      render: (v) => <span style={{ color: "#888" }}>{v}</span>,
    },
    { title: "Country", dataIndex: "country", width: 110, ellipsis: true },
    { title: "State", dataIndex: "state", width: 110, ellipsis: true },
    { title: "City", dataIndex: "city", width: 110, ellipsis: true },
    {
      title: "Status",
      dataIndex: "status",
      width: 90,
      render: (v) => (
        <b style={{ color: v === "Active" ? "#52c41a" : "#ff4d4f" }}>{v}</b>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      width: 110,
      render: (v) => <span style={{ color: "#888", fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Activate",
      dataIndex: "activateDate",
      width: 110,
      render: (v) => <span style={{ color: "#888", fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Expiry",
      dataIndex: "expiryDate",
      width: 110,
      render: (v) => <span style={{ color: "#888", fontSize: 12 }}>{v}</span>,
    },
    { title: "Plan", dataIndex: "planId", width: 90 },
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
    {
      title: "Role",
      dataIndex: "role",
      width: 90,
      render: (v) => (
        <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
          {v}
        </Tag>
      ),
    },
    { title: "Permission", dataIndex: "permissionId", width: 100 },
    {
      title: "Broker Addon",
      dataIndex: "broker_addon",
      width: 110,
      align: "center",
      render: (v) => (v ? "Yes" : "No"),
    },
    {
      title: "Active Broker",
      dataIndex: "active_broker",
      width: 110,
      align: "center",
      render: (v) => (v ? "Yes" : "No"),
    },
    { title: "Group", dataIndex: "group", width: 100 },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 70,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
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
      ),
    },
  ];

  return (
    <CommonTableLayout
      columns={columns}
      dataSource={users}
      rowKey="id"
      searchFields={["first_name", "last_name", "email", "phone_number"]}
      searchPlaceholder="Search history..."
      exportFilename="history"
      exportHeaders={[
        "ID",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Country",
        "State",
        "City",
        "Status",
        "Created",
        "Activate",
        "Expiry",
        "Plan",
        "Role",
        "Group",
      ]}
      exportMapper={(u) => [
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number,
        u.country,
        u.state,
        u.city,
        u.status,
        u.created_at,
        u.activateDate,
        u.expiryDate,
        u.planId,
        u.role,
        u.group,
      ]}
    />
  );
}
