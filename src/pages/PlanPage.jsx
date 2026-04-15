import React from "react";
import { Tag, Dropdown, App, Tooltip } from "antd";
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
  // Note: Ensure 'plans' passed from parent matches the 'data' structure provided
  const { data } = usePlansList();

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
        p.id === record?.id
          ? { ...p, isActive: p.isActive === 1 ? 0 : 1 }
          : p,
      ),
    );
    message.success("Status updated");
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: 150,
      render: (v, record) => (
        <div>
          <b style={{ display: "block" }}>{v}</b>
          <span style={{ fontSize: "10px", color: "#999" }}>{record?.code}</span>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 100,
      render: (v) => <b>₹{parseFloat(v).toLocaleString()}</b>,
    },
    {
      title: "Type",
      dataIndex: "planType",
      width: 90,
      render: (v) => <Tag color={v === "addon" ? "orange" : "purple"}>{v?.toUpperCase()}</Tag>,
    },
    {
      title: "Billing",
      dataIndex: "subscriptionPeriod",
      width: 110,
      render: (v) => <Tag color="blue">{v}</Tag>,
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
      title: "Created",
      dataIndex: "created_at",
      width: 180,
      render: (v) => <span style={{ color: "#888", fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      width: 100,
      render: (v, record) => (
        <span
          onClick={() => toggleStatus(record)}
          style={{ cursor: "pointer" }}
        >
          {v === 1 ? (
            <>
              <CheckCircleFilled style={{ color: "#52c41a", marginRight: 4 }} />
              <b style={{ color: "#52c41a" }}>Active</b>
            </>
          ) : (
            <>
              <CloseCircleFilled style={{ color: "#ff4d4f", marginRight: 4 }} />
              <b style={{ color: "#ff4d4f" }}>Inactive</b>
            </>
          )}
        </span>
      ),
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   fixed: "right",
    //   width: 70,
    //   align: "center",
    //   render: (_, record) => (
    //     <Dropdown
    //       menu={{
    //         items: [
    //           {
    //             key: "delete",
    //             label: "Delete",
    //             icon: <DeleteOutlined />,
    //             danger: true,
    //             onClick: () => handleDelete(record?.id),
    //           },
    //         ],
    //       }}
    //     >
    //       <MoreOutlined style={{ cursor: "pointer", fontSize: 16 }} />
    //     </Dropdown>
    //   ),
    // },
  ];

  return (
    <CommonTableLayout
      columns={columns}
      dataSource={data?.data || []}
      rowKey="id"
      searchFields={["name", "code", "subscriptionPeriod", "planType"]}
      searchPlaceholder="Search by name, code or period..."
      exportFilename="plans_export"
      exportHeaders={[
        "ID",
        "Name",
        "Code",
        "Price",
        "Type",
        "Period",
        "Status",
        "Created At",
      ]}
      exportMapper={(p) => [
        p.id,
        p.name,
        p.code,
        p.price,
        p.planType,
        p.subscriptionPeriod,
        p.isActive === 1 ? "Active" : "Inactive",
        p.created_at,
      ]}
    />
  );
}