import React, { useEffect } from "react";
import { Tag, Tooltip, Badge } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import CommonTableLayout from "../components/CommonTableLayout";
import { usePlansList } from "../hooks/usePlansList";
import { renderDateWithHover } from "./UsersPage";
import { useQueryClient } from "@tanstack/react-query";

export default function PlanPage() {
  const { data } = usePlansList();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!data) return
    queryClient.setQueryData(['title'], { title: 'Plans', count: data?.data?.length || '' })
  }, [data])
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: 150,
      fixed: "left",
      render: (v) => <b>{v}</b>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Code",
      dataIndex: "code",
      width: 100,
      render: (v) => <Tag color="geekblue">{v}</Tag>,
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 120,
      render: (v) => <b style={{ color: "#1677ff" }}>₹{parseFloat(v).toLocaleString()}</b>,
      sorter: (a, b) => parseFloat(a.price) - parseFloat(b.price),
    },
    {
      title: "Type",
      dataIndex: "planType",
      width: 100,
      render: (v) => (
        <Tag color={v === "addon" ? "orange" : "purple"}>
          {v?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Billing Period",
      dataIndex: "subscriptionPeriod",
      width: 120,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Brokers",
      dataIndex: "brokerNumber",
      width: 100,
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      width: 110,
      render: (v) => (
        <span>
          {v === 1 ? (
            <Tag color="green" icon={<CheckCircleFilled />}>Active</Tag>
          ) : (
            <Tag color="error" icon={<CloseCircleFilled />}>Inactive</Tag>
          )}
        </span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      width: 200,
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v}>
          <span style={{ color: "#666", fontSize: 12 }}>{v}</span>
        </Tooltip>
      ),
    },
    {
      title: "Features",
      dataIndex: "featureLists",
      width: 250,
      ellipsis: true,
      render: (v) => {
        try {
          const features = JSON.parse(v);
          return (
            <Tooltip title={features.join(", ")}>
              <span style={{ color: "#888", fontSize: 12 }}>
                {features.length} Features: {features[0]}...
              </span>
            </Tooltip>
          );
        } catch (e) {
          return <span style={{ color: "#888", fontSize: 12 }}>{v}</span>;
        }
      },
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      width: 180,
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (v) => renderDateWithHover(v),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      width: 180,
      sorter: (a, b) => new Date(a.updated_at) - new Date(b.updated_at),
      render: (v) => renderDateWithHover(v),
    },
  ];

  return (
    <CommonTableLayout
      columns={columns}
      dataSource={data?.data || []}
      rowKey="id"
      searchFields={["name", "code", "subscriptionPeriod", "planType", "description"]}
      searchPlaceholder="Search by name, code, type or period..."
      exportFilename="subscription_plans"
      exportHeaders={[
        "ID",
        "Name",
        "Code",
        "Price",
        "Plan Type",
        "Subscription Period",
        "Brokers",
        "Status",
        "Description",
        "Features",
        "Created At",
        "Updated At",
      ]}
      exportMapper={(p) => [
        p.id,
        p.name,
        p.code,
        p.price,
        p.planType,
        p.subscriptionPeriod,
        p.brokerNumber,
        p.isActive === 1 ? "Active" : "Inactive",
        p.description,
        p.featureLists, // Exports raw JSON string of features
        p.created_at,
        p.updated_at,
      ]}
    />
  );
}