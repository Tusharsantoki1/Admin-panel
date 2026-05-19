import React, { useEffect, useMemo, useState } from "react";
import { Tag, Dropdown, App, Tooltip, DatePicker, Space, Typography } from "antd";
import {
  DeleteOutlined,
  MoreOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
} from "@ant-design/icons";
import CommonTableLayout from "../components/CommonTableLayout";
import { usePaymentHistoryList } from "../hooks/usePaymentHistoryList";
import { normalizeLabel, renderDateWithHover } from "./UsersPage";
import { useQueryClient } from "@tanstack/react-query";

export default function History() {
  // Note: the prop 'users' should ideally be 'historyData' now based on your JSON
  const { data } = usePaymentHistoryList();

  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState(null);
  console.log(dateRange);

  useEffect(() => {
    if (!data) return
    queryClient.setQueryData(['title'], { title: 'Payment History', count: data?.data?.length || '' })
  }, [data, queryClient]);

  const filteredData = useMemo(() => {
    let result = data?.data || [];
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf("day").valueOf();
      const endDate = dateRange[1].endOf("day").valueOf();

      result = result.filter((item) => {
        if (!item.created_at) return false;
        const itemDate = new Date(item.created_at).getTime();
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    return result;
  }, [data, dateRange]);

  const totalAmountSum = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);
  }, [filteredData]);

  const columns = [
    {
      title: "First Name",
      dataIndex: "first_name",
      width: 120,
      ellipsis: true,
      render: (value, record) => normalizeLabel(record?.user?.first_name),
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      width: 120,
      ellipsis: true,
      render: (value, record) => normalizeLabel(record?.user?.last_name),
    },
    {
      title: "Email", dataIndex: "email", width: 220, ellipsis: true,
      render: (value, record) => normalizeLabel(record?.user?.email),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      width: 180,
      render: renderDateWithHover,
      sorter: (a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      },
      // Optional: Set default sort to descending (newest first)
      defaultSortOrder: 'descend',
    },
    {
      title: "Order ID",
      dataIndex: "order_id",
      width: 180,
      render: (v) => <span style={{ fontFamily: "monospace", fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Payment ID",
      dataIndex: "paymentId",
      width: 180,
      render: (v) => <span style={{ fontFamily: "monospace", fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Status",
      dataIndex: "paymentStatus",
      width: 120,
      render: (v) => (
        <Tag color={v === "captured" ? "green" : "processing"} icon={v === "captured" ? <CheckCircleFilled /> : <ClockCircleOutlined />}>
          {v?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      width: 130,
      render: (v) => <b style={{ color: "#1677ff" }}>₹{parseFloat(v).toLocaleString()}</b>,
    },
    {
      title: "Subtotal",
      dataIndex: "subTotalAmount",
      width: 110,
      render: (v) => `₹${v}`,
    },
    {
      title: "Tax",
      dataIndex: "taxAmount",
      width: 100,
      render: (v) => `₹${v}`,
    },
    {
      title: "Discount",
      dataIndex: "discountAmount",
      width: 110,
      render: (v) => <span style={{ color: "#ff4d4f" }}>-₹{v}</span>,
    },
    {
      title: "Final Amt",
      dataIndex: "afterDiscountAmount",
      width: 110,
      render: (v) => <b>₹{v}</b>,
    },
    {
      title: "Method",
      dataIndex: "paymentMethod",
      width: 100,
      render: (v) => <Tag>{v?.toUpperCase()}</Tag>,
    },
    {
      title: "Plan ID",
      dataIndex: "planId",
      width: 80,
    },
    {
      title: "Period",
      dataIndex: "subscriptionPeriod",
      width: 110,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Days",
      dataIndex: "subscriptionDays",
      width: 80,
    },
    {
      title: "Addon Days",
      dataIndex: "addonDays",
      width: 100,
    },
    {
      title: "Brokers",
      dataIndex: "brokers",
      width: 90,
    },
    {
      title: "Coupon",
      dataIndex: "couponCode",
      width: 110,
      render: (v) => v ? <Tag color="orange">{v}</Tag> : "—",
    },
    {
      title: "Coupon Val",
      dataIndex: "couponValue",
      width: 110,
      render: (v) => v || "—",
    },
    {
      title: "Offer Type",
      dataIndex: "offerType",
      width: 110,
    },
    {
      title: "Txn Type",
      dataIndex: "transactionType",
      width: 110,
      render: (v) => v || "—",
    },
    {
      title: "Activation",
      dataIndex: "activationDate",
      width: 180,
      render: renderDateWithHover,
    },
    {
      title: "Expiry",
      dataIndex: "expiryDate",
      width: 180,
      render: renderDateWithHover,
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      width: 180,
      render: renderDateWithHover,
    },
  ];

  return (
    <>
      <CommonTableLayout
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        toolbarExtra={
          <Space wrap>
            <DatePicker.RangePicker
              onChange={(dates) => setDateRange(dates)}
              allowClear
            />
            {dateRange && <Typography.Text strong style={{ color: "#1677ff", marginLeft: 8 }}>
              Total Amount: ₹{totalAmountSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography.Text>}
          </Space>
        }
        searchFields={["order_id", "paymentId", "couponCode", "paymentStatus", "userId", "user.email", "user.first_name", "user.last_name"]}
        searchPlaceholder="Search by Order, Payment ID or Coupon..."
        exportFilename="payment_history"
        exportHeaders={[
          "ID", "User ID", "First Name", "Last Name", "Email", "Order ID", "Payment ID", "Status", "Method",
          "Subtotal", "Tax", "Discount", "Total", "After Discount",
          "Plan ID", "Period", "Days", "Addon Days", "Brokers",
          "Coupon Code", "Coupon Value", "Offer Type", "Txn Type",
          "Activation Date", "Expiry Date", "Created At", "Updated At"
        ]}
        exportMapper={(u) => [
          u.id, u.userId, u?.user?.first_name, u?.user?.last_name, u?.user?.email, u.order_id, u.paymentId, u.paymentStatus, u.paymentMethod,
          u.subTotalAmount, u.taxAmount, u.discountAmount, u.totalAmount, u.afterDiscountAmount,
          u.planId, u.subscriptionPeriod, u.subscriptionDays, u.addonDays, u.brokers,
          u.couponCode, u.couponValue, u.offerType, u.transactionType,
          u.activationDate, u.expiryDate, u.created_at, u.updated_at
        ]}
      />
      <style>{`
        .ant-picker {
          height: 28px !important;
          width: 250px !important;
          padding-left: 5px;
          padding-right: 5px;
        }
        .ant-picker-input {
          height: 28px !important;
        }
      `}</style>
    </>
  );
}