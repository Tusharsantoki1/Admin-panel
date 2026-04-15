import React, { useEffect, useMemo, useState } from "react";
import { Tag, Space, Dropdown, App, Select, Button, Tooltip, Form, InputNumber } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExperimentOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import CommonTableLayout from "../components/CommonTableLayout";
import { useUsersList } from "../hooks/useUsersList";
import { useTrialExtend } from "../hooks/useTrialExtend";

const StatusIcon = ({ value }) =>
  Number(value) ? (
    <CheckCircleFilled style={{ color: "#52c41a", fontSize: 14 }} />
  ) : (
    <CloseCircleFilled style={{ color: "#ff4d4f", fontSize: 14 }} />
  );

const normalizeLabel = (value) => {
  if (value === null || value === undefined || value === "") return "--";
  return String(value)
    .trim()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value) => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDateAndTime = (value) => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function UsersPage() {
  const { message, modal } = App.useApp();
  const [page, setPage] = useState(1);
  const [form] = Form.useForm();
  const [pageSize, setPageSize] = useState(25);
  const [emailSearch, setEmailSearch] = useState("");
  const [debouncedEmailSearch, setDebouncedEmailSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [roleFilter, setRoleFilter] = useState(undefined);
  const [countryFilter, setCountryFilter] = useState(undefined);
  const [sortOrder, setSortOrder] = useState("desc");
  const { mutateAsync: trialExtend } = useTrialExtend();
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEmailSearch(emailSearch.trim());
      setPage(1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [emailSearch]);

  const filters = useMemo(() => {
    const nextFilters = {};

    if (debouncedEmailSearch) nextFilters.email = debouncedEmailSearch;
    if (statusFilter) nextFilters.status = statusFilter;
    if (roleFilter) nextFilters.role = roleFilter;
    if (countryFilter) nextFilters.country = countryFilter;

    return nextFilters;
  }, [countryFilter, debouncedEmailSearch, roleFilter, statusFilter]);

  const { data: usersResponse, isLoading, isFetching, refetch } = useUsersList({
    page,
    limit: pageSize,
    filters,
    sortOrder,
  });

  const users = usersResponse?.data || [];
  const pagination = usersResponse?.pagination || {};

  const handleTrial = (user) => {
    // Reset form to defaults every time the modal opens
    form.setFieldsValue({ days: 15, brokers: 1 });

    modal.confirm({
      title: <div style={{ display: 'flex', alignItems: 'center' }}> <ClockCircleOutlined style={{ marginRight: 10, fontSize: 14 }} />Extend trial for</div>,
      icon: null,
      width: 420,
      maskClosable: true,
      content: (
        <Form
          form={form}
          layout="vertical"
          initialValues={{ days: 15, brokers: 1 }}
          style={{ marginTop: 10 }}
        >
          <Form.Item
            label="Days"
            name="days"
            rules={[
              { required: true, message: "Please enter number of days" },
              { type: "number", min: 1, max: 15, message: "Days must be between 1 and 15" },
            ]}
          >
            <InputNumber
              min={1}
              max={15}
              style={{ width: "100%" }}
              placeholder="Enter days (max 15)"
            />
          </Form.Item>

          <Form.Item
            label="Brokers"
            name="brokers"
            rules={[
              { required: true, message: "Please enter number of brokers" },
              { type: "number", min: 1, max: 10, message: "Brokers must be between 1 and 10" },
            ]}
          >
            <InputNumber
              min={1}
              max={10}
              style={{ width: "100%" }}
              placeholder="Enter brokers (max 10)"
            />
          </Form.Item>
        </Form>
      ),
      okText: "Extend Trial",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          // Validate before submitting
          const values = await form.validateFields();

          await trialExtend({
            days: values.days,
            brokers: values.brokers,
            user_id: user.id,
          });
          refetch();
          message.success(`Trial extended by ${values.days} days for ${user.email}`);
        } catch (err) {
          // If it's a form validation error, keep the modal open by re-throwing
          if (err?.errorFields) {
            return Promise.reject(err);
          }
          message.error("Failed to extend trial. Please try again.");
          return Promise.reject(err);
        }
      },
    });
  };

  const handleDelete = (id) => {
    modal.confirm({
      title: "Confirm Delete",
      okType: "danger",
      onOk: () => {
        message.success(`User ${id} deleted`);
      },
    });
  };

  const clearFilters = () => {
    setEmailSearch("");
    setDebouncedEmailSearch("");
    setStatusFilter(undefined);
    setRoleFilter(undefined);
    setCountryFilter(undefined);
    setSortOrder("desc");
    setPage(1);
    setPageSize(25);
  };

  const renderDateWithHover = (value) => (
    <Tooltip title={value || "N/A"}>
      <span style={{ cursor: 'pointer' }}>
        {formatDate(value)}
      </span>
    </Tooltip>
  );

  const columns = [
    {
      title: "First Name",
      dataIndex: "first_name",
      width: 120,
      ellipsis: true,
      render: (value) => normalizeLabel(value),
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      width: 120,
      ellipsis: true,
      render: (value) => normalizeLabel(value),
    },
    { title: "Email", dataIndex: "email", width: 220, ellipsis: true },
    { title: "Phone", dataIndex: "phone_number", width: 150, ellipsis: true },
    {
      title: "Status",
      dataIndex: "status",
      width: 100,
      render: (status) => {
        const value = String(status || "").toLowerCase();
        const color = value === "active" ? "#52c41a" : "#faad14";
        return <b style={{ color }}>{normalizeLabel(status)}</b>;
      },
    },
    {
      title: "Role",
      dataIndex: "role",
      width: 100,
      render: (role) => (
        <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
          {normalizeLabel(role)}
        </Tag>
      ),
    },
    {
      title: "Country",
      dataIndex: "country",
      width: 120,
      ellipsis: true,
      render: (value) => normalizeLabel(value),
    },
    { title: "State", dataIndex: "state", width: 110, ellipsis: true },
    {
      title: "City",
      dataIndex: "city",
      width: 110,
      ellipsis: true,
      render: (value) => normalizeLabel(value),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      width: 120,
      render: renderDateWithHover,
    },
    {
      title: "Activate",
      dataIndex: "activateDate",
      width: 120,
      render: renderDateWithHover,
    },
    {
      title: "Expiry",
      dataIndex: "expiryDate",
      width: 120,
      render: renderDateWithHover,
    },
    { title: "Plan ID", dataIndex: "planId", width: 90, render: (value) => value ?? "--" },
    {
      title: "Mob Ver",
      dataIndex: "isMobileVerified",
      width: 80,
      align: "center",
      render: (value) => <StatusIcon value={value} />,
    },
    {
      title: "Email Ver",
      dataIndex: "isEmailVerified",
      width: 80,
      align: "center",
      render: (value) => <StatusIcon value={value} />,
    },
    {
      title: "Perm ID",
      dataIndex: "permissionId",
      width: 100,
      render: (value) => value ?? "--",
    },
    {
      title: "B. Addon",
      dataIndex: "broker_addon",
      width: 90,
      align: "center",
      render: (value) => (value ? "Yes" : "No"),
    },
    {
      title: "B. Active",
      dataIndex: "active_broker",
      width: 90,
      align: "center",
      render: (value) => (value ? "Yes" : "No"),
    },
    {
      title: "Group",
      dataIndex: "group",
      width: 100,
      render: (value) => value ?? "--",
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <div onClick={() => handleTrial(record)}>
            <ClockCircleOutlined style={{ cursor: "pointer", fontSize: 16 }} />
          </div>
          {/* <Dropdown
            menu={{
              items: [
                {
                  key: "trial",
                  label: "Trial",
                  icon: <ExperimentOutlined />,
                  onClick: () => handleTrial(record),
                },
                // {
                //   key: "delete",
                //   label: "Delete",
                //   icon: <DeleteOutlined />,
                //   danger: true,
                //   onClick: () => handleDelete(record.id),
                // },
              ],
            }}
          >
            <MoreOutlined style={{ cursor: "pointer", fontSize: 16 }} />
          </Dropdown> */}
        </Space >
      ),
    },
  ];

  return (
    <CommonTableLayout
      columns={columns}
      dataSource={users}
      rowKey="id"
      loading={isLoading || isFetching}
      pageSize={pageSize}
      disableClientSearch
      searchValue={emailSearch}
      onSearchChange={setEmailSearch}
      searchPlaceholder="Search by email..."
      pagination={{
        current: pagination.page || page,
        pageSize: pagination.limit || pageSize,
        total: pagination.total || 0,
        size: "small",
        position: ["bottomRight"],
        showSizeChanger: true,
        pageSizeOptions: [10, 25, 50, 100],
        onChange: (nextPage, nextPageSize) => {
          setPage(nextPage);
          if (nextPageSize !== pageSize) {
            setPageSize(nextPageSize);
            if (nextPage !== 1) setPage(1);
          }
        },
      }}
      toolbarExtra={
        <Space wrap>
          <Select
            allowClear
            placeholder="Status"
            style={{ width: 120 }}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            options={[
              { label: "Active", value: "active" },
              { label: "Trial", value: "trial" },
              { label: "Expired", value: "expired" },
            ]}
          />
          <Select
            allowClear
            placeholder="Role"
            style={{ width: 120 }}
            value={roleFilter}
            onChange={(value) => {
              setRoleFilter(value);
              setPage(1);
            }}
            options={[
              { label: "Admin", value: "admin" },
              { label: "User", value: "user" },
            ]}
          />
          <Select
            placeholder="Sort"
            style={{ width: 140 }}
            value={sortOrder}
            onChange={(value) => {
              setSortOrder(value);
              setPage(1);
            }}
            options={[
              { label: "Newest first", value: "desc" },
              { label: "Oldest first", value: "asc" },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Refresh
          </Button>
          <Button onClick={clearFilters}>Reset</Button>
        </Space>
      }
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
      exportMapper={(user) => [
        user.id,
        user.first_name,
        user.last_name,
        user.email,
        user.phone_number,
        user.status,
        user.role,
        user.country,
        user.city,
        user.created_at,
      ]}
    />
  );
}
