import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Tag, Descriptions, Table, Divider, App, Flex } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";

export default function UserDetailsPage({ users, setUsers }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { modal, message } = App.useApp();

  const user = users?.find((u) => String(u.id) === id);

  if (!user)
    return (
      <div style={{ padding: 32, color: "#888", fontSize: 14 }}>
        User not found.
      </div>
    );

  const handleDelete = () => {
    modal.confirm({
      title: "Delete User",
      content: `Are you sure you want to delete ${user.first_name} ${user.last_name}?`,
      okType: "danger",
      okText: "Delete",
      onOk: () => {
        setUsers?.((prev) => prev.filter((u) => u.id !== user.id));
        message.success("User deleted");
        navigate(-1);
      },
    });
  };

  const VerifiedIcon = ({ value }) =>
    value ? (
      <CheckCircleFilled style={{ color: "#52c41a" }} />
    ) : (
      <CloseCircleFilled style={{ color: "#ff4d4f" }} />
    );

  const descProps = {
    size: "small",
    bordered: true,
    column: { xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 },
    labelStyle: {
      fontWeight: 500,
      color: "#555",
      fontSize: 12,
      background: "#fafafa",
      width: 140,
    },
    contentStyle: { fontSize: 13, color: "#1a1a1a" },
  };

  // Dummy transaction history rows
  const txHistory = user.transactions || [
    {
      key: 1,
      date: user.created_at || "--",
      status: "Success",
      type: "Subscription",
      remark: "Trial",
    },
  ];

  const txColumns = [
    { title: "Sr. No.", key: "sr", width: 70, render: (_, __, i) => i + 1 },
    { title: "Date", dataIndex: "date", width: 180 },
    {
      title: "Transaction Status",
      dataIndex: "status",
      width: 140,
      render: (v) => (
        <b style={{ color: v === "Success" ? "#52c41a" : "#ff4d4f" }}>{v}</b>
      ),
    },
    { title: "Transaction Type", dataIndex: "type", width: 160 },
    { title: "Remark", dataIndex: "remark" },
  ];

  return (
    <div
      style={{
        padding: "4px 10px",
        minHeight: "100vh",
      }}
    >
      {/* ── Back ── */}
      <Flex
        justify="space-between"
        align="center"
        style={{
          padding: "4px 20px",
          height: "40px",
          borderBottom: "1px solid #f0f0f0",
          flexShrink: 0,
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{
            marginBottom: 12,
            color: "#003eb3",
            fontWeight: 500,
            paddingLeft: 0,
          }}
        >
          Back
        </Button>
      </Flex>
      {/* ── CUSTOMER INFORMATION ── */}
      <SectionCard
        title="Customer Information"
        statusLabel={user.status}
        actions={
          <>
            {/* <Button
              size="small"
              icon={<EditOutlined />}
              style={{ borderColor: "#003eb3", color: "#003eb3" }}
            >
              Edit
            </Button> */}
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <Descriptions {...descProps}>
          <Descriptions.Item label="Name">
            {user.first_name} {user.last_name}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {user.email}
              <VerifiedIcon value={user.isEmailVerified} />
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Mobile No">
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {user.phone_number}
              <VerifiedIcon value={user.isMobileVerified} />
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Created Date">
            {user.created_at || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Source">—</Descriptions.Item>
          <Descriptions.Item label="User Role">
            <Tag color="blue" style={{ fontSize: 11 }}>
              {user.role}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Inquiry Date">—</Descriptions.Item>
          <Descriptions.Item label="User Category">—</Descriptions.Item>
          <Descriptions.Item label="Sales Person">—</Descriptions.Item>
          <Descriptions.Item label="Registration Date">—</Descriptions.Item>
          <Descriptions.Item label="App Version">—</Descriptions.Item>
          <Descriptions.Item label="ICAIMemberId">—</Descriptions.Item>
        </Descriptions>
      </SectionCard>

      {/* ── SUBSCRIPTION DETAIL ── */}
      <SectionCard title="Subscription Detail">
        <Descriptions {...descProps}>
          <Descriptions.Item label="Activation Date">
            {user.activateDate || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Plan Status">
            <b style={{ color: "#ff4d4f" }}>Expired</b>
          </Descriptions.Item>
          <Descriptions.Item label="Expiry Date">
            {user.expiryDate || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Plan Name">
            {user.planId || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Renew Date">—</Descriptions.Item>
          <Descriptions.Item label="Plan Family Name">
            {user.planId || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Company Credits">
            Unlimited
          </Descriptions.Item>
          <Descriptions.Item label="User Credits">2 / 0</Descriptions.Item>
          <Descriptions.Item label="Client Credits">
            Unlimited
          </Descriptions.Item>
          <Descriptions.Item label="GST Credits">Unlimited</Descriptions.Item>
          <Descriptions.Item label="Group">
            {user.group || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Permission ID">
            {user.permissionId || "—"}
          </Descriptions.Item>
        </Descriptions>
      </SectionCard>

      {/* ── TRANSACTION DETAIL ── */}
      <SectionCard title="Transaction Detail">
        <Descriptions {...descProps} style={{ marginBottom: 16 }}>
          <Descriptions.Item label="Organization">
            {user.city || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="GST Number">—</Descriptions.Item>
          <Descriptions.Item label="User Code">—</Descriptions.Item>
          <Descriptions.Item label="Referral Code">—</Descriptions.Item>
          <Descriptions.Item label="Address">
            {user.city || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Pin Code">—</Descriptions.Item>
          <Descriptions.Item label="City">{user.city || "—"}</Descriptions.Item>
          <Descriptions.Item label="State">
            {user.state || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Country">
            {user.country || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Broker Addon">
            {user.broker_addon ? "Yes" : "No"}
          </Descriptions.Item>
          <Descriptions.Item label="Active Broker">
            {user.active_broker ? "Yes" : "No"}
          </Descriptions.Item>
        </Descriptions>

        <Divider
          orientation="left"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#333",
            margin: "12px 0",
          }}
        >
          Transaction History
        </Divider>

        <Table
          columns={txColumns}
          dataSource={txHistory}
          rowKey="key"
          size="small"
          bordered
          pagination={false}
          scroll={{ x: "max-content" }}
          style={{ fontSize: 12 }}
        />
      </SectionCard>

      <style>{`
        .ant-descriptions-item-label {
          font-size: 12px !important;
          font-weight: 500 !important;
        }
        .ant-descriptions-item-content {
          font-size: 13px !important;
        }
        .ant-table-thead > tr > th {
          background: #f5f7fa !important;
          font-size: 12px !important;
          color: #888 !important;
        }
      `}</style>
    </div>
  );
}

/* ── Reusable section card ── */
function SectionCard({ title, statusLabel, actions, children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8ecf0",
        borderRadius: 8,
        marginBottom: 16,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 3,
              height: 16,
              background: "#003eb3",
              borderRadius: 2,
            }}
          />
          <span style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>
            {title}
          </span>
          {statusLabel && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: statusLabel === "Active" ? "#52c41a" : "#ff4d4f",
              }}
            >
              {statusLabel}
            </span>
          )}
        </div>
        {actions && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {actions}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px" }}>{children}</div>
    </div>
  );
}
