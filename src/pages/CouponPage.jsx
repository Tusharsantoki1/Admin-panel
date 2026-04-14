import React, { useState } from "react";
import { Tag, Space, Dropdown, App } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import CommonTableLayout from "../components/CommonTableLayout";

export default function CouponPage({ coupons, setCoupons }) {
  const { message, modal } = App.useApp();

  const handleDelete = (id) => {
    modal.confirm({
      title: "Confirm Delete",
      okType: "danger",
      onOk: () => {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        message.success("Coupon deleted");
      },
    });
  };

  const toggleStatus = (record) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === record.id
          ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" }
          : c,
      ),
    );
    message.success("Status updated");
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      width: 130,
      render: (v) => (
        <Tag style={{ fontFamily: "monospace", fontSize: 12 }}>{v}</Tag>
      ),
    },
    {
      title: "Discount",
      dataIndex: "discount",
      width: 100,
      render: (v, r) => <b>{r.type === "Percentage" ? `${v}%` : `$${v}`}</b>,
    },
    {
      title: "Type",
      dataIndex: "type",
      width: 110,
      render: (v) => <span style={{ color: "#888", fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 100,
      render: (v, record) => (
        <span
          onClick={() => toggleStatus(record)}
          style={{ cursor: "pointer" }}
        >
          {v === "Active" ? (
            <CheckCircleFilled style={{ color: "#52c41a", marginRight: 4 }} />
          ) : (
            <CloseCircleFilled style={{ color: "#ff4d4f", marginRight: 4 }} />
          )}
          <b style={{ color: v === "Active" ? "#52c41a" : "#ff4d4f" }}>{v}</b>
        </span>
      ),
    },
    {
      title: "Uses / Max",
      dataIndex: "uses",
      width: 110,
      render: (v, r) => (
        <span style={{ color: "#888", fontSize: 12 }}>
          {v} / {r.max_uses}
        </span>
      ),
    },
    {
      title: "Expiry",
      dataIndex: "expiry",
      width: 110,
      render: (v) => <span style={{ color: "#888", fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Created",
      dataIndex: "created_at",
      width: 110,
      render: (v) => <span style={{ color: "#888", fontSize: 12 }}>{v}</span>,
    },
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
      dataSource={coupons}
      rowKey="id"
      searchFields={["code", "type", "status"]}
      searchPlaceholder="Search coupons..."
      exportFilename="coupons"
      exportHeaders={[
        "ID",
        "Code",
        "Type",
        "Discount",
        "Status",
        "Uses",
        "Max Uses",
        "Expiry",
        "Created At",
      ]}
      exportMapper={(c) => [
        c.id,
        c.code,
        c.type,
        c.discount,
        c.status,
        c.uses,
        c.max_uses,
        c.expiry,
        c.created_at,
      ]}
    />
  );
}
