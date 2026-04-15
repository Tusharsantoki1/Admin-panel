import React from "react";
import { Tag, Dropdown, App } from "antd";
import {
  DeleteOutlined,
  MoreOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import CommonTableLayout from "../components/CommonTableLayout";
import { usePlansList } from "../hooks/usePlansList";

export default function PlanPage({ plans, setPlans }) {
  const { message, modal } = App.useApp();
  const { data } = usePlansList();
  console.log(data);

  const handleDelete = (id) => {
    modal.confirm({
      title: "Confirm Delete",
      okType: "danger",
      onOk: () => {
        setPlans((prev) => prev.filter((p) => p.id !== id));
        message.success("Plan deleted");
      },
    });
  };

  const toggleStatus = (record) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === record.id
          ? { ...p, status: p.status === "Active" ? "Inactive" : "Active" }
          : p,
      ),
    );
    message.success("Status updated");
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: 140,
      render: (v) => <b>{v}</b>,
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 90,
      render: (v) => <b>${v}</b>,
    },
    {
      title: "Billing",
      dataIndex: "billing",
      width: 110,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Features",
      dataIndex: "features",
      width: 220,
      ellipsis: true,
      render: (v) => <span style={{ color: "#888", fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Users",
      dataIndex: "users",
      width: 80,
      render: (v) => v?.toLocaleString(),
    },
    {
      title: "Created",
      dataIndex: "created_at",
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
      dataSource={plans}
      rowKey="id"
      searchFields={["name", "billing", "features", "status"]}
      searchPlaceholder="Search plans..."
      exportFilename="plans"
      exportHeaders={[
        "ID",
        "Name",
        "Price",
        "Billing",
        "Features",
        "Users",
        "Status",
        "Created At",
      ]}
      exportMapper={(p) => [
        p.id,
        p.name,
        p.price,
        p.billing,
        p.features,
        p.users,
        p.status,
        p.created_at,
      ]}
    />
  );
}
