import React, { useEffect, useMemo, useState } from "react";
import { Tag, Space, Dropdown, App, Select, Button, Tooltip, Form, InputNumber, Modal, DatePicker, Input, Timeline, Typography } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExperimentOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  ReloadOutlined,
  CalendarOutlined,
  ProfileOutlined,
  EditOutlined, // ✅ Added Edit icon for Group
} from "@ant-design/icons";
import dayjs from "dayjs";
import CommonTableLayout from "../components/CommonTableLayout";
import { useUsersList } from "../hooks/useUsersList";
import { useTrialExtend } from "../hooks/useTrialExtend";
import { useUpdateFollowup } from "../hooks/useUpdateFollowup";
import { useQueryClient } from "@tanstack/react-query";
import { TrialModal } from "../components/TrialModal";
import { useTrialdetail } from "../hooks/useTrialdetail";
import { useExpiryCheck } from "../hooks/useExpiryCheck";
import { useAddNote } from "../hooks/useAddNote";
import { Link } from "react-router-dom";
import { useUpdateGroup } from "../hooks/useUpdateGroup";

const { Text } = Typography;

const StatusIcon = ({ value }) =>
  Number(value) ? (
    <CheckCircleFilled style={{ color: "#52c41a", fontSize: 14 }} />
  ) : (
    <CloseCircleFilled style={{ color: "#ff4d4f", fontSize: 14 }} />
  );

export const normalizeLabel = (value) => {
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

export const formatDateAndTime = (value) => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
};

export const renderDateWithHover = (value) => (
  <Tooltip title={formatDateAndTime(value) || "N/A"}>
    <span style={{ cursor: 'pointer' }}>
      {formatDate(value)}
    </span>
  </Tooltip>
);

export const renderDateTimeWithHover = (value) => (
  <Tooltip title={formatDateAndTime(value) || "N/A"}>
    <span style={{ cursor: 'pointer' }}>
      {formatDateAndTime(value)}
    </span>
  </Tooltip>
);


export default function UsersPage() {
  const { message, modal } = App.useApp();
  const [page, setPage] = useState(1);
  const [form] = Form.useForm();
  const [followupForm] = Form.useForm();
  const [groupForm] = Form.useForm(); // ✅ Added Group Form

  const queryClient = useQueryClient();
  const [pageSize, setPageSize] = useState(25);
  const [emailSearch, setEmailSearch] = useState("");
  const [debouncedEmailSearch, setDebouncedEmailSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [roleFilter, setRoleFilter] = useState(undefined);
  const [countryFilter, setCountryFilter] = useState(undefined);
  const [viewModeFilter, setViewModeFilter] = useState(undefined);
  const [sortOrder, setSortOrder] = useState("desc");

  const { mutateAsync: trialExtend, isPending } = useTrialExtend();
  const { mutateAsync: updateFollowup, isPending: isFollowupPending } = useUpdateFollowup();
  const { mutateAsync: expiryCheck, isPending: isExpiryPending } = useExpiryCheck();
  const { mutateAsync: addNote, isPending: isNotePending } = useAddNote();
  const { mutateAsync: updateGroup, isPending: isGroupPending } = useUpdateGroup(); // ✅ Initialize Group Update Hook

  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false); // ✅ Group Modal State
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteDate, setNewNoteDate] = useState(dayjs());
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: trial_activates, isLoading: trial_history_loading } = useTrialdetail(selectedUser?.id);

  const parsedNotes = useMemo(() => {
    if (!selectedUser?.notes) return [];
    try {
      return typeof selectedUser.notes === 'string' ? JSON.parse(selectedUser.notes) : selectedUser.notes;
    } catch (e) {
      return [];
    }
  }, [selectedUser?.notes]);

  const handleOpenTrial = (user) => {
    setSelectedUser(user);
    setIsTrialModalOpen(true);
  };

  const handleTrialSubmit = async (values) => {
    try {
      await trialExtend({
        days: values.days,
        brokers: values.brokers,
        user_id: selectedUser.id,
      });
      queryClient.invalidateQueries(["user", "trial", selectedUser.id]);
      message.success("Trial extended successfully");
      setIsTrialModalOpen(false);
      refetch();
    } catch (err) {
      message.error("Failed to extend trial");
    }
  };

  const handleOpenFollowup = (user) => {
    setSelectedUser(user);
    followupForm.setFieldsValue({
      followup: user.followup ? dayjs(user.followup) : dayjs(),
    });
    setIsFollowupModalOpen(true);
  };

  const handleFollowupSubmit = async () => {
    try {
      const values = await followupForm.validateFields();
      const formattedDate = values.followup ? values.followup.format("YYYY-MM-DD HH:mm:ss") : null;

      await updateFollowup({
        user_id: selectedUser.id,
        followup: formattedDate,
      });

      message.success("Follow-up date updated successfully");
      setIsFollowupModalOpen(false);
      refetch();
    } catch (err) {
      if (!err.errorFields) message.error("Failed to update follow-up date");
    }
  };

  // ✅ Open Group Modal
  const handleOpenGroup = (user) => {
    setSelectedUser(user);
    groupForm.setFieldsValue({ group: user.group });
    setIsGroupModalOpen(true);
  };

  // ✅ Submit Group Update
  const handleGroupSubmit = async () => {
    try {
      const values = await groupForm.validateFields();
      await updateGroup({
        user_id: selectedUser.id,
        group: values.group,
      });
      message.success("Group updated successfully");
      setIsGroupModalOpen(false);
      refetch();
    } catch (err) {
      if (!err.errorFields) message.error("Failed to update group");
    }
  };

  const handleOpenNotes = (user) => {
    setSelectedUser(user);
    setNewNoteText("");
    setNewNoteDate(dayjs());
    setIsNotesModalOpen(true);
  };

  const handleAddNoteSubmit = async () => {
    if (!newNoteText.trim()) return message.warning("Note description cannot be empty.");
    try {
      const formattedDate = newNoteDate ? newNoteDate.format("YYYY-MM-DD HH:mm:ss") : dayjs().format("YYYY-MM-DD HH:mm:ss");
      const currentTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

      await addNote({
        user_id: selectedUser.id,
        description: newNoteText,
        note_date: formattedDate,
      });

      message.success("Note added successfully");
      setNewNoteText("");
      setNewNoteDate(dayjs());
      refetch();

      setSelectedUser(prev => ({
        ...prev,
        notes: [
          ...parsedNotes,
          { note_date: formattedDate, description: newNoteText, created_at: currentTime }
        ]
      }));
    } catch (err) {
      console.log("Failed to add note.", err);
    }
  };

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
    if (viewModeFilter) nextFilters.view_mode = viewModeFilter;

    return nextFilters;
  }, [countryFilter, debouncedEmailSearch, roleFilter, statusFilter, viewModeFilter]);

  const { data: usersResponse, isLoading, isFetching, refetch } = useUsersList({
    page,
    limit: pageSize,
    filters,
    sortOrder,
  });

  useEffect(() => {
    if (!usersResponse) return
    queryClient.setQueryData(['title'], { title: 'Users', count: usersResponse?.counts?.total || '' })
  }, [usersResponse, queryClient])

  const users = usersResponse?.data || [];
  const pagination = usersResponse?.pagination || {};

  const handleTrial = (user) => {
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
              { type: "number", min: 1, max: 31, message: "Days must be between 1 and 31" },
            ]}
          >
            <InputNumber min={1} max={31} style={{ width: "100%" }} placeholder="Enter days (max 31)" />
          </Form.Item>

          <Form.Item
            label="Brokers"
            name="brokers"
            rules={[
              { required: true, message: "Please enter number of brokers" },
              { type: "number", min: 1, max: 10, message: "Brokers must be between 1 and 10" },
            ]}
          >
            <InputNumber min={1} max={10} style={{ width: "100%" }} placeholder="Enter brokers (max 10)" />
          </Form.Item>
        </Form>
      ),
      okText: "Extend Trial",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const values = await form.validateFields();
          await trialExtend({
            days: values.days,
            brokers: values.brokers,
            user_id: user.id,
          });
          refetch();
          message.success(`Trial extended by ${values.days} days for ${user.email}`);
        } catch (err) {
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
    setViewModeFilter(undefined);
    setSortOrder("desc");
    setPage(1);
    setPageSize(25);
  };

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
    {
      title: "Email", dataIndex: "email", width: 220, ellipsis: true,
      render: (text, record) => (
        <Link
          to={`/user/${record.id}`}
          style={{ color: "#1890ff", fontWeight: 500, textDecoration: "none" }}
        >
          {text}
        </Link>
      )
    },
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
    {
      title: "Follow Up",
      dataIndex: "followup",
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
      width: 120, // ✅ Widened for edit icon
      render: (value, record) => (
        <Space>
          {value ?? "--"}
          <Tooltip title="Edit Group">
            <EditOutlined
              style={{ color: "#1890ff", cursor: "pointer", marginLeft: 4 }}
              onClick={() => handleOpenGroup(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Extend Trial">
            <div onClick={() => handleOpenTrial(record)}>
              <ClockCircleOutlined style={{ cursor: "pointer", fontSize: 16 }} />
            </div>
          </Tooltip>
          <Tooltip title="Follow-up Date">
            <div onClick={() => handleOpenFollowup(record)}>
              <CalendarOutlined style={{ cursor: "pointer", fontSize: 16, color: record.followup ? "#fa8c16" : "inherit" }} />
            </div>
          </Tooltip>
          <Tooltip title="Notes">
            <div onClick={() => handleOpenNotes(record)}>
              <ProfileOutlined style={{ cursor: "pointer", fontSize: 16, color: parsedNotes?.length ? "#1890ff" : "inherit" }} />
            </div>
          </Tooltip>
        </Space >
      ),
    },
  ];

  const checkExpiry = async () => {
    try {
      await expiryCheck();
      message.success("Expiry check completed successfully");
      refetch();
    } catch (err) {
      message.error("Failed to perform expiry check. Please try again.");
    }
  };

  return (
    <>
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
              placeholder="Monitoring"
              style={{ width: 160 }}
              value={viewModeFilter}
              onChange={(value) => {
                setViewModeFilter(value);
                setPage(1);
              }}
              options={[
                { value: "expire_10", label: "Expire in 10 days" },
                { value: "expired_30", label: "Expired in 30 days" },
                { value: "followup", label: "Follow up date" },
              ]}
            />
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
            <Button loading={isExpiryPending} onClick={checkExpiry}>Expiry Check</Button>
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

      <TrialModal
        visible={isTrialModalOpen}
        user={selectedUser}
        historyData={trial_activates?.data || []}
        isLoadingHistory={trial_history_loading}
        loadingSubmit={isPending}
        onCancel={() => setIsTrialModalOpen(false)}
        onOk={handleTrialSubmit}
      />

      {/* ✅ Group Update Modal */}
      <Modal
        title="Update Group"
        open={isGroupModalOpen}
        onOk={handleGroupSubmit}
        onCancel={() => setIsGroupModalOpen(false)}
        confirmLoading={isGroupPending}
        width={400}
        okText="Save"
      >
        <Form form={groupForm} layout="vertical" style={{ marginTop: 10 }}>
          <Form.Item label="Group Name" name="group">
            <Input placeholder="Enter group name" allowClear />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<div style={{ display: 'flex', alignItems: 'center' }}><CalendarOutlined style={{ marginRight: 10, fontSize: 14 }} /> Set Follow-up Date</div>}
        open={isFollowupModalOpen}
        onOk={handleFollowupSubmit}
        onCancel={() => setIsFollowupModalOpen(false)}
        confirmLoading={isFollowupPending}
        width={400}
        okText="Save"
      >
        <Form form={followupForm} layout="vertical" style={{ marginTop: 10 }}>
          <Form.Item label="Follow-up Date & Time" name="followup">
            <DatePicker
              showTime
              size="middle"
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: "100%" }}
              placeholder="Select date and time"
              allowClear
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Notes Modal */}
      <Modal
        title={<div><ProfileOutlined style={{ marginRight: 8 }} /> User Notes</div>}
        open={isNotesModalOpen}
        onCancel={() => setIsNotesModalOpen(false)}
        footer={null}
        width={500}
      >
        <div style={{ marginTop: 20 }}>
          <div style={{ marginBottom: 24, background: '#f9f9f9', padding: 16, borderRadius: 6 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Note Date & Time</label>
              <DatePicker
                showTime
                value={newNoteDate}
                onChange={(date) => setNewNoteDate(date)}
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: "100%" }}
                placeholder="Select custom date and time"
                allowClear={false}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Description</label>
              <Input.TextArea
                rows={3}
                placeholder="Enter note description here..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                style={{ marginBottom: 12 }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <Button type="primary" loading={isNotePending} onClick={handleAddNoteSubmit}>
                Save Note
              </Button>
            </div>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: 10 }}>
            {parsedNotes.length > 0 ? (
              <Timeline
                items={parsedNotes
                  .sort((a, b) => new Date(b.note_date || b.date) - new Date(a.note_date || a.date))
                  .map((note, idx) => ({
                    color: "blue",
                    children: (
                      <>
                        <div style={{ fontSize: 13, color: "#1890ff", fontWeight: 500, marginBottom: 2 }}>
                          {formatDateAndTime(note.note_date || note.date)}
                        </div>
                        {note.created_at && (
                          <div style={{ fontSize: 11, color: "#bfbfbf", marginBottom: 6 }}>
                            Added: {formatDateAndTime(note.created_at)}
                          </div>
                        )}
                        <Text style={{ display: 'block', background: '#f5f5f5', padding: '8px 12px', borderRadius: 4, marginTop: 4 }}>
                          {note.description}
                        </Text>
                      </>
                    ),
                  }))}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#bfbfbf', padding: '20px 0' }}>
                No notes found for this user.
              </div>
            )}
          </div>
        </div>
      </Modal>

      <style>{`
        .ant-picker-input {
          height: 28px !important;
          margin-left: 5px;
          margin-right: 5px;
        }
      `}</style>
    </>
  );
}