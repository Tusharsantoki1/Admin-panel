import React, { useEffect } from "react";
import { Tag, Dropdown, App, Tooltip } from "antd";
import {
  DeleteOutlined,
  MoreOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import CommonTableLayout from "../components/CommonTableLayout";
import { useCuponList } from "../hooks/useCuponList";
import { renderDateWithHover } from "./UsersPage";
import { useQueryClient } from "@tanstack/react-query";

export default function CouponPage() {
  const { data } = useCuponList();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!data) return
    queryClient.setQueryData(['title'], { title: 'Coupons', count: data?.data?.length || '' })
  }, [data])

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: 150,
      fixed: "left",
      render: (v) => <b>{v}</b>,
    },
    {
      title: "Code",
      dataIndex: "code",
      width: 120,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      width: 180,
      render: renderDateWithHover,
    },
    {
      title: "Value",
      dataIndex: "value",
      width: 100,
      render: (v) => <b>{parseFloat(v)}</b>,
    },
    {
      title: "Amount Type",
      dataIndex: "amountType",
      width: 120,
      render: (v) => <Tag color="purple">{v}</Tag>,
    },
    {
      title: "Offer Type",
      dataIndex: "offerType",
      width: 110,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      width: 100,
      render: (v, record) => (
        <span>
          {v === 1 ? (
            <Tag color="darkgreen" icon={<CheckCircleFilled />}>Active</Tag>
          ) : (
            <Tag color="error" icon={<CloseCircleFilled />}>Inactive</Tag>
          )}
        </span>
      ),
    },
    {
      title: "Multi-Use",
      dataIndex: "isMultipleTimeUsable",
      width: 110,
      render: (v) => (v === 1 ? <Tag color="cyan">Yes</Tag> : <Tag>No</Tag>),
    },
    {
      title: "Redeem Count",
      dataIndex: "redeemCount",
      width: 120,
      sorter: (a, b) => a.redeemCount - b.redeemCount,
    },
    {
      title: "Max Redemption",
      dataIndex: "maxRedemption",
      width: 140,
      render: (v) => v || "Unlimited",
    },
    {
      title: "Min Bill Amount",
      dataIndex: "minimumBillAmount",
      width: 130,
      render: (v) => `₹${parseFloat(v)}`,
    },
    {
      title: "For Plans",
      dataIndex: "forPlans",
      width: 130,
      render: (v) => {
        try {
          const plans = JSON.parse(v);
          return plans.map((id) => id).join(", ");
        } catch {
          return v;
        }
      },
    },
    {
      title: "Redeemed By",
      dataIndex: "redeemedBy",
      width: 150,
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v}>
          <span style={{ fontSize: 11, color: "#999" }}>{v}</span>
        </Tooltip>
      ),
    },
    {
      title: "Expiry At",
      dataIndex: "expiryAt",
      width: 160,
      render: renderDateWithHover,
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      width: 180,
      render: renderDateWithHover,
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
    //             onClick: () => handleDelete(record.id),
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
      // Allowing horizontal scroll for many columns
      scroll={{ x: 2200 }}
      searchFields={["name", "code", "amountType", "offerType"]}
      searchPlaceholder="Search coupons..."
      exportFilename="coupons_full_data"
      exportHeaders={[
        "ID",
        "Name",
        "Code",
        "Value",
        "Amount Type",
        "Offer Type",
        "Is Active",
        "Is Multiple Use",
        "Redeem Count",
        "Max Redemption",
        "Min Bill Amount",
        "For Plans",
        "Redeemed By",
        "Expiry At",
        "Created At",
        "Updated At",
      ]}
      exportMapper={(c) => [
        c.id,
        c.name,
        c.code,
        c.value,
        c.amountType,
        c.offerType,
        c.isActive,
        c.isMultipleTimeUsable,
        c.redeemCount,
        c.maxRedemption,
        c.minimumBillAmount,
        c.forPlans,
        c.redeemedBy,
        c.expiryAt,
        c.created_at,
        c.updated_at,
      ]}
    />
  );
}