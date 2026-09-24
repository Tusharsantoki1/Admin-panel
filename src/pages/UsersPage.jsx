import React, { useEffect, useMemo, useState } from "react";
import { Tag, Space, Dropdown, App, Select, Button, Tooltip, Form, InputNumber, Modal, DatePicker, Input, Timeline, Typography, Popover, Badge as AntBadge, Flex, Checkbox, List, Segmented } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExperimentOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  ReloadOutlined,
  CalendarOutlined,
  ProfileOutlined,
  EditOutlined,
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  UndoOutlined,
  HolderOutlined,
  TableOutlined,
  AppstoreOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import CommonTableLayout from "../components/CommonTableLayout";
import KanbanUsers from "./KanbanUsers";
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
import { useUpdatePermission } from "../hooks/useUpdatePermission";
import { usePermissionList } from "../hooks/usePermissionList";
import { StateList, getStateName } from "../utils/helpers";

export { StateList, getStateName };

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

export const DEFAULT_KANBAN_STAGES = [
  { value: "NC", label: "NC (Not Contacted)", color: "default", visible: true },
  { value: "A2C", label: "A2C (Attempt to Contact)", color: "orange", visible: true },
  { value: "Contacted", label: "Contacted", color: "blue", visible: true },
  { value: "DS", label: "DS (Demo Scheduled)", color: "purple", visible: true },
  { value: "DD", label: "DD (Demo Done)", color: "cyan", visible: true },
  { value: "Payment Done", label: "Payment Done", color: "green", visible: true },
  { value: "Lost", label: "Lost", color: "red", visible: true },
  { value: "OLD", label: "OLD (Old Lead)", color: "geekblue", visible: true },
];

export const LEAD_STAGES = DEFAULT_KANBAN_STAGES;

const KANBAN_STORAGE_KEY = "hedgex_kanban_stages_config";

export const getSavedKanbanStages = () => {
  try {
    const saved = localStorage.getItem(KANBAN_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const savedValues = new Set(parsed.map((s) => s.value));
        const merged = [...parsed];
        DEFAULT_KANBAN_STAGES.forEach((stage) => {
          if (!savedValues.has(stage.value)) {
            merged.push(stage);
          }
        });
        return merged;
      }
    }
  } catch (e) {
    console.error("Failed to load kanban stages config", e);
  }
  return DEFAULT_KANBAN_STAGES;
};

export const renderLeadStatusTag = (status) => {
  const matched = LEAD_STAGES.find((s) => s.value === status) || LEAD_STAGES[0];
  return (
    <Tag color={matched.color} style={{ fontSize: 11, fontWeight: 600 }}>
      {matched.value}
    </Tag>
  );
};

export const hasUserNotes = (notes) => {
  if (!notes) return false;
  if (Array.isArray(notes)) return notes.length > 0;
  if (typeof notes === "string") {
    const trimmed = notes.trim();
    if (!trimmed || trimmed === "[]" || trimmed === "null") return false;
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch (e) {
      return false;
    }
  }
  return false;
};

export const DEFAULT_COLUMN_KEYS = [
  { key: "created_at", label: "Created Date", visible: true },
  { key: "first_name", label: "First Name", visible: true },
  { key: "last_name", label: "Last Name", visible: true },
  { key: "email", label: "Email", visible: true },
  { key: "phone_number", label: "Phone", visible: true },
  { key: "referral_code", label: "Referral Code", visible: true },
  { key: "status", label: "Status", visible: true },
  { key: "lead_status", label: "Lead Status", visible: true },
  { key: "group", label: "Group", visible: true },
  { key: "city", label: "City", visible: true },
  { key: "activateDate", label: "Activate Date", visible: true },
  { key: "expiryDate", label: "Expiry Date", visible: true },
  { key: "followup", label: "Follow Up Date", visible: true },
  { key: "state", label: "State", visible: true },
  { key: "country", label: "Country", visible: true },
  { key: "planId", label: "Plan ID", visible: true },
  { key: "isMobileVerified", label: "Mobile Verified", visible: true },
  { key: "isEmailVerified", label: "Email Verified", visible: true },
  { key: "permissionId", label: "Permission ID", visible: true },
  { key: "broker_addon", label: "Broker Addon", visible: true },
  { key: "active_broker", label: "Active Broker", visible: true },
  { key: "role", label: "Role", visible: true },
  { key: "action", label: "Actions", visible: true, locked: true },
];

const STORAGE_KEY = "hedgex_users_columns_config";

const getSavedColumnsConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const savedKeys = new Set(parsed.map((col) => col.key));
        const merged = [...parsed];
        DEFAULT_COLUMN_KEYS.forEach((col) => {
          if (!savedKeys.has(col.key)) {
            merged.push(col);
          }
        });
        return merged;
      }
    }
  } catch (e) {
    console.error("Failed to load column config from localStorage", e);
  }
  return DEFAULT_COLUMN_KEYS;
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
  const [viewType, setViewType] = useState("table"); // "table" | "kanban"
  const [form] = Form.useForm();
  const [followupForm] = Form.useForm();
  const [groupForm] = Form.useForm(); // ✅ Added Group Form
  const [permissionForm] = Form.useForm(); // ✅ Added Permission Form

  const queryClient = useQueryClient();
  const [pageSize, setPageSize] = useState(25);
  const [emailSearch, setEmailSearch] = useState("");
  const [debouncedEmailSearch, setDebouncedEmailSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [roleFilter, setRoleFilter] = useState(undefined);
  const [countryFilter, setCountryFilter] = useState(undefined);
  const [viewModeFilter, setViewModeFilter] = useState(undefined);
  const [groupFilter, setGroupFilter] = useState(undefined);
  const [leadStatusFilter, setLeadStatusFilter] = useState(undefined);
  const [sortOrder, setSortOrder] = useState("desc");

  // Popover temporary filter states
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [tempStatusFilter, setTempStatusFilter] = useState(undefined);
  const [tempLeadStatusFilter, setTempLeadStatusFilter] = useState(undefined);
  const [tempGroupFilter, setTempGroupFilter] = useState(undefined);
  const [tempViewModeFilter, setTempViewModeFilter] = useState(undefined);

  // Column customization states
  const [columnsConfig, setColumnsConfig] = useState(getSavedColumnsConfig);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  // Kanban Stages customization states
  const [kanbanStagesConfig, setKanbanStagesConfig] = useState(getSavedKanbanStages);
  const [isKanbanModalOpen, setIsKanbanModalOpen] = useState(false);
  const [draggedKanbanIndex, setDraggedKanbanIndex] = useState(null);

  const updateKanbanStagesConfig = (newConfig) => {
    setKanbanStagesConfig(newConfig);
    try {
      localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.error("Failed to save kanban stages config", e);
    }
  };

  const handleKanbanDragStart = (e, index) => {
    setDraggedKanbanIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleKanbanDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleKanbanDrop = (e, targetIndex) => {
    e.preventDefault();
    const fromIndexStr = e.dataTransfer.getData("text/plain");
    const fromIndex = fromIndexStr !== "" ? parseInt(fromIndexStr, 10) : draggedKanbanIndex;
    if (fromIndex === null || isNaN(fromIndex) || fromIndex === targetIndex) return;
    const newConfig = [...kanbanStagesConfig];
    const [draggedItem] = newConfig.splice(fromIndex, 1);
    newConfig.splice(targetIndex, 0, draggedItem);
    updateKanbanStagesConfig(newConfig);
    setDraggedKanbanIndex(null);
  };

  const moveKanbanStageUp = (index) => {
    if (index <= 0) return;
    const newConfig = [...kanbanStagesConfig];
    const temp = newConfig[index - 1];
    newConfig[index - 1] = newConfig[index];
    newConfig[index] = temp;
    updateKanbanStagesConfig(newConfig);
  };

  const moveKanbanStageDown = (index) => {
    if (index >= kanbanStagesConfig.length - 1) return;
    const newConfig = [...kanbanStagesConfig];
    const temp = newConfig[index + 1];
    newConfig[index + 1] = newConfig[index];
    newConfig[index] = temp;
    updateKanbanStagesConfig(newConfig);
  };

  const toggleKanbanStageVisibility = (value) => {
    const newConfig = kanbanStagesConfig.map((stage) =>
      stage.value === value ? { ...stage, visible: stage.visible === false } : stage
    );
    updateKanbanStagesConfig(newConfig);
  };

  const resetKanbanStagesConfig = () => {
    updateKanbanStagesConfig(DEFAULT_KANBAN_STAGES);
  };

  const updateColumnsConfig = (newConfig) => {
    setColumnsConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.error("Failed to save column config to localStorage", e);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;
    const newConfig = [...columnsConfig];
    const [draggedItem] = newConfig.splice(draggedItemIndex, 1);
    newConfig.splice(targetIndex, 0, draggedItem);
    updateColumnsConfig(newConfig);
    setDraggedItemIndex(null);
  };

  const toggleColumnVisibility = (key) => {
    const newConfig = columnsConfig.map((col) =>
      col.key === key ? { ...col, visible: !col.visible } : col
    );
    updateColumnsConfig(newConfig);
  };

  const resetColumnsConfig = () => {
    updateColumnsConfig(DEFAULT_COLUMN_KEYS);
  };

  const handleOpenFilterPopover = (open) => {
    if (open) {
      setTempStatusFilter(statusFilter);
      setTempLeadStatusFilter(leadStatusFilter);
      setTempGroupFilter(groupFilter);
      setTempViewModeFilter(viewModeFilter);
    }
    setIsFilterPopoverOpen(open);
  };

  const handleApplyPopoverFilters = () => {
    setStatusFilter(tempStatusFilter);
    setLeadStatusFilter(tempLeadStatusFilter);
    setGroupFilter(tempGroupFilter);
    setViewModeFilter(tempViewModeFilter);
    setPage(1);
    setIsFilterPopoverOpen(false);
  };

  const handleResetPopoverFilters = () => {
    setTempStatusFilter(undefined);
    setTempLeadStatusFilter(undefined);
    setTempGroupFilter(undefined);
    setTempViewModeFilter(undefined);
    setStatusFilter(undefined);
    setLeadStatusFilter(undefined);
    setGroupFilter(undefined);
    setViewModeFilter(undefined);
    setPage(1);
    setIsFilterPopoverOpen(false);
  };

  const activeFiltersCount =
    (statusFilter ? 1 : 0) +
    (leadStatusFilter ? 1 : 0) +
    (groupFilter ? 1 : 0) +
    (viewModeFilter ? 1 : 0);

  const filterPopoverContent = (
    <div style={{ width: 280, padding: "4px 0" }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: "#111", marginBottom: 12, borderBottom: "1px solid #f0f0f0", paddingBottom: 6 }}>
        Filter Leads
      </div>

      <Space direction="vertical" style={{ width: "100%" }} size={12}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 4 }}>
            Lead Stage
          </label>
          <Select
            allowClear
            placeholder="All Lead Stages"
            value={tempLeadStatusFilter}
            onChange={(val) => setTempLeadStatusFilter(val)}
            style={{ width: "100%" }}
            options={LEAD_STAGES.map((s) => ({ value: s.value, label: s.label }))}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 4 }}>
            Group
          </label>
          <Input
            allowClear
            placeholder="Search / enter group name"
            value={tempGroupFilter}
            onChange={(e) => setTempGroupFilter(e.target.value ? e.target.value : undefined)}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 4 }}>
            Status
          </label>
          <Select
            allowClear
            placeholder="All Statuses"
            value={tempStatusFilter}
            onChange={(val) => setTempStatusFilter(val)}
            style={{ width: "100%" }}
            options={[
              { label: "Active", value: "active" },
              { label: "Trial", value: "trial" },
              { label: "Expired", value: "expired" },
            ]}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#666", marginBottom: 4 }}>
            Monitoring
          </label>
          <Select
            allowClear
            placeholder="All Monitoring"
            value={tempViewModeFilter}
            onChange={(val) => setTempViewModeFilter(val)}
            style={{ width: "100%" }}
            options={[
              { value: "expire_10", label: "Expire in 10 days" },
              { value: "expired_30", label: "Expired in 30 days" },
              { value: "followup", label: "Follow up date" },
            ]}
          />
        </div>

        <Flex justify="space-between" align="center" style={{ marginTop: 8, paddingTop: 10, borderTop: "1px solid #f0f0f0" }}>
          <Button size="small" onClick={handleResetPopoverFilters}>
            Reset
          </Button>
          <Button size="small" type="primary" onClick={handleApplyPopoverFilters}>
            Confirm
          </Button>
        </Flex>
      </Space>
    </div>
  );

  const { mutateAsync: trialExtend, isPending } = useTrialExtend();
  const { mutateAsync: updateFollowup, isPending: isFollowupPending } = useUpdateFollowup();
  const { mutateAsync: expiryCheck, isPending: isExpiryPending } = useExpiryCheck();
  const { mutateAsync: addNote, isPending: isNotePending } = useAddNote();
  const { mutateAsync: updateGroup, isPending: isGroupPending } = useUpdateGroup(); // ✅ Initialize Group Update Hook
  const { mutateAsync: updatePermission, isPending: isPermissionPending } = useUpdatePermission(); // ✅ Initialize Permission Hook
  const { data: permissionsResponse } = usePermissionList();
  const permissionsList = permissionsResponse?.data || [];

  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false); // ✅ Group Modal State
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false); // ✅ Permission Modal State
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteDate, setNewNoteDate] = useState(dayjs());
  const [newNoteLeadStatus, setNewNoteLeadStatus] = useState("NC");
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

  // ✅ Open Permission Modal
  const handleOpenPermission = (user) => {
    setSelectedUser(user);
    permissionForm.setFieldsValue({ permissionId: user.permissionId });
    setIsPermissionModalOpen(true);
  };

  // ✅ Submit Permission Update
  const handlePermissionSubmit = async () => {
    try {
      const values = await permissionForm.validateFields();
      await updatePermission({
        user_id: selectedUser.id,
        permissionId: values.permissionId,
      });
      message.success("Permission updated successfully");
      setIsPermissionModalOpen(false);
      refetch();
    } catch (err) {
      if (!err.errorFields) message.error("Failed to update permission");
    }
  };

  const handleOpenNotes = (user) => {
    setSelectedUser(user);
    setNewNoteText("");
    setNewNoteDate(dayjs());
    // Extract current lead status if available
    let currentStatus = user?.lead_status;
    if (!currentStatus && user?.notes) {
      try {
        const notesArr = typeof user.notes === 'string' ? JSON.parse(user.notes) : user.notes;
        if (Array.isArray(notesArr) && notesArr.length > 0) {
          currentStatus = notesArr[notesArr.length - 1]?.lead_status;
        }
      } catch (e) { }
    }
    setNewNoteLeadStatus(currentStatus || "NC");
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
        lead_status: newNoteLeadStatus,
      });

      message.success("Note added successfully");
      setNewNoteText("");
      setNewNoteDate(dayjs());
      refetch();

      setSelectedUser(prev => ({
        ...prev,
        lead_status: newNoteLeadStatus,
        notes: [
          ...parsedNotes,
          {
            note_date: formattedDate,
            description: newNoteText,
            lead_status: newNoteLeadStatus,
            created_at: currentTime,
            updated_at: currentTime
          }
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

    if (debouncedEmailSearch) nextFilters.search = { key: ["first_name", "last_name", "email", "phone_number", "group", "referral_code"], value: debouncedEmailSearch };
    if (statusFilter) nextFilters.status = statusFilter;
    if (roleFilter) nextFilters.role = roleFilter;
    if (countryFilter) nextFilters.country = countryFilter;
    if (viewModeFilter) nextFilters.view_mode = viewModeFilter;
    if (groupFilter) nextFilters.group = groupFilter;
    if (leadStatusFilter) nextFilters.lead_status = leadStatusFilter;

    return nextFilters;
  }, [countryFilter, debouncedEmailSearch, roleFilter, statusFilter, viewModeFilter, groupFilter, leadStatusFilter]);

  const handleTableChange = (paginationInfo, tableFilters) => {
    if (tableFilters.status) {
      setStatusFilter(tableFilters.status[0] || undefined);
    } else {
      setStatusFilter(undefined);
    }

    if (tableFilters.lead_status) {
      setLeadStatusFilter(tableFilters.lead_status[0] || undefined);
    } else {
      setLeadStatusFilter(undefined);
    }

    if (tableFilters.group) {
      setGroupFilter(tableFilters.group[0] || undefined);
    } else {
      setGroupFilter(undefined);
    }

    if (tableFilters.view_mode) {
      setViewModeFilter(tableFilters.view_mode[0] || undefined);
    } else {
      setViewModeFilter(undefined);
    }

    setPage(1);
  };

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

  const availableGroups = useMemo(() => {
    const set = new Set();
    users.forEach((u) => {
      if (u.group) set.add(u.group);
    });
    return Array.from(set).map((g) => ({ label: g, value: g }));
  }, [users]);

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
    setGroupFilter(undefined);
    setLeadStatusFilter(undefined);
    setSortOrder("desc");
    setPage(1);
    setPageSize(25);
  };

  const rawColumns = useMemo(() => [
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
      width: 120,
      ellipsis: true,
      render: (value) => normalizeLabel(value),
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
      width: 120,
      ellipsis: true,
      render: (value) => normalizeLabel(value),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      ellipsis: true,
      render: (text, record) => (
        <Link
          to={`/user/${record.id}`}
          style={{ color: "#1890ff", fontWeight: 500, textDecoration: "none" }}
        >
          {text}
        </Link>
      ),
    },
    { title: "Phone", dataIndex: "phone_number", key: "phone_number", width: 150, ellipsis: true },
    {
      title: "Referral Code",
      dataIndex: "referral_code",
      key: "referral_code",
      width: 130,
      ellipsis: true,
      render: (value) => (value ? <Tag color="green" style={{ fontSize: 11, margin: 0 }}>{value}</Tag> : "--"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
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
      key: "role",
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
      key: "country",
      width: 120,
      ellipsis: true,
      render: (value) => normalizeLabel(value),
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      width: 140,
      ellipsis: true,
      render: (value) => getStateName(value),
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      width: 110,
      ellipsis: true,
      render: (value) => normalizeLabel(value),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: renderDateWithHover,
    },
    {
      title: "Activate",
      dataIndex: "activateDate",
      key: "activateDate",
      width: 120,
      render: renderDateWithHover,
    },
    {
      title: "Expiry",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 120,
      render: renderDateWithHover,
    },
    {
      title: "Follow Up",
      dataIndex: "followup",
      key: "followup",
      width: 120,
      render: renderDateWithHover,
    },
    { title: "Plan ID", dataIndex: "planId", key: "planId", width: 90, render: (value) => value ?? "--" },
    {
      title: "Mob Ver",
      dataIndex: "isMobileVerified",
      key: "isMobileVerified",
      width: 80,
      align: "center",
      render: (value) => <StatusIcon value={value} />,
    },
    {
      title: "Email Ver",
      dataIndex: "isEmailVerified",
      key: "isEmailVerified",
      width: 80,
      align: "center",
      render: (value) => <StatusIcon value={value} />,
    },
    {
      title: "Perm ID",
      dataIndex: "permissionId",
      key: "permissionId",
      width: 120,
      render: (value, record) => (
        <Space>
          {value != null && value !== "" ? (
            <Tag color="geekblue" style={{ fontSize: 11, margin: 0 }}>
              {value}
            </Tag>
          ) : (
            "--"
          )}
          <Tooltip title="Switch Permission">
            <EditOutlined
              style={{ color: "#1890ff", cursor: "pointer", marginLeft: 2 }}
              onClick={() => handleOpenPermission(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "B. Addon",
      dataIndex: "broker_addon",
      key: "broker_addon",
      width: 90,
      align: "center",
      render: (value) => (value ? "Yes" : "No"),
    },
    {
      title: "B. Active",
      dataIndex: "active_broker",
      key: "active_broker",
      width: 90,
      align: "center",
      render: (value) => (value ? "Yes" : "No"),
    },
    {
      title: "Lead Status",
      dataIndex: "lead_status",
      key: "lead_status",
      width: 140,
      render: (value, record) => {
        let status = value;
        if (!status && record.notes) {
          try {
            const parsed = typeof record.notes === 'string' ? JSON.parse(record.notes) : record.notes;
            if (Array.isArray(parsed) && parsed.length > 0) {
              const latest = parsed[parsed.length - 1];
              status = latest?.lead_status;
            }
          } catch (e) { }
        }
        return renderLeadStatusTag(status || "NC");
      },
    },
    {
      title: "Group",
      dataIndex: "group",
      key: "group",
      width: 130,
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
      render: (_, record) => {
        const hasNotes = hasUserNotes(record.notes);
        return (
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
            <Tooltip title={hasNotes ? "View Notes (Has Notes)" : "Add Note (No Notes)"}>
              <div onClick={() => handleOpenNotes(record)}>
                <ProfileOutlined
                  style={{
                    cursor: "pointer",
                    fontSize: 16,
                    color: hasNotes ? "#1890ff" : "#bfbfbf",
                  }}
                />
              </div>
            </Tooltip>
          </Space>
        );
      },
    },
  ], [handleOpenTrial, handleOpenFollowup, handleOpenNotes, handleOpenGroup, handleOpenPermission]);

  const columnsMap = useMemo(() => {
    const map = {};
    rawColumns.forEach((col) => {
      const k = col.key || col.dataIndex;
      map[k] = col;
    });
    return map;
  }, [rawColumns]);

  const activeColumns = useMemo(() => {
    const cols = [];
    columnsConfig.forEach((cfg) => {
      if (cfg.visible !== false && columnsMap[cfg.key]) {
        cols.push(columnsMap[cfg.key]);
      }
    });
    return cols;
  }, [columnsConfig, columnsMap]);

  const checkExpiry = async () => {
    try {
      await expiryCheck();
      message.success("Expiry check completed successfully");
      refetch();
    } catch (err) {
      message.error("Failed to perform expiry check. Please try again.");
    }
  };

  const [kanbanRefreshKey, setKanbanRefreshKey] = useState(0);

  const kanbanGlobalFilters = useMemo(() => ({
    ...(statusFilter && { status: statusFilter }),
    ...(groupFilter && { group: groupFilter }),
    ...(viewModeFilter && { view_mode: viewModeFilter }),
  }), [statusFilter, groupFilter, viewModeFilter]);

  const handleRefreshAll = () => {
    if (viewType === "table") {
      refetch();
    } else {
      setKanbanRefreshKey((prev) => prev + 1);
    }
  };

  const toolbarExtraContent = (
    <Space wrap>
      <Segmented
        value={viewType}
        onChange={(val) => setViewType(val)}
        options={[
          { value: "table", icon: <TableOutlined />, label: "Table" },
          { value: "kanban", icon: <AppstoreOutlined />, label: "Kanban" },
        ]}
      />
      <Popover
        content={filterPopoverContent}
        trigger="click"
        open={isFilterPopoverOpen}
        onOpenChange={handleOpenFilterPopover}
        placement="bottomLeft"
      >
        <AntBadge count={activeFiltersCount} size="small" offset={[-2, 2]}>
          <Button icon={<FilterOutlined />}>
            Filters
          </Button>
        </AntBadge>
      </Popover>
      <Button
        icon={<SettingOutlined />}
        onClick={() => {
          if (viewType === "table") {
            setIsColumnModalOpen(true);
          } else {
            setIsKanbanModalOpen(true);
          }
        }}
      >
        {viewType === "table" ? "Columns" : "Kanban Stages"}
      </Button>
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
      <Button icon={<ReloadOutlined />} onClick={handleRefreshAll}>
        Refresh
      </Button>
      <Button onClick={clearFilters}>Reset Filters</Button>
      <Button loading={isExpiryPending} onClick={checkExpiry}>Expiry Check</Button>
    </Space>
  );

  return (
    <>
      {viewType === "table" ? (
        <CommonTableLayout
          columns={activeColumns}
          dataSource={users}
          rowKey="id"
          loading={isLoading || isFetching}
          pageSize={pageSize}
          disableClientSearch
          searchValue={emailSearch}
          onSearchChange={setEmailSearch}
          searchPlaceholder="Search by email, name, phone, group, or referral code..."
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
          toolbarExtra={toolbarExtraContent}
          exportFilename="users"
          exportHeaders={[
            "ID",
            "First Name",
            "Last Name",
            "Email",
            "Phone",
            "Referral Code",
            "Status",
            "Role",
            "Country",
            "State",
            "City",
            "Created At",
          ]}
          exportMapper={(user) => [
            user.id,
            user.first_name,
            user.last_name,
            user.email,
            user.phone_number,
            user.referral_code || "--",
            user.status,
            user.role,
            user.country,
            getStateName(user.state),
            user.city,
            user.created_at,
          ]}
        />
      ) : (
        <div style={{ background: "#fff", height: "100%", display: "flex", flexDirection: "column" }}>
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
            {toolbarExtraContent}
            <Input
              placeholder="Search by email, name, phone, group, or referral code..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              size="middle"
              allowClear
              style={{ maxWidth: 280 }}
              value={emailSearch}
              onChange={(e) => setEmailSearch(e.target.value)}
            />
          </Flex>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <KanbanUsers
              searchQuery={debouncedEmailSearch}
              globalFilters={kanbanGlobalFilters}
              sortOrder={sortOrder}
              refreshKey={kanbanRefreshKey}
              stagesConfig={kanbanStagesConfig}
              onOpenNotes={handleOpenNotes}
              onOpenFollowup={handleOpenFollowup}
              onOpenTrial={handleOpenTrial}
              onOpenGroup={handleOpenGroup}
            />
          </div>
        </div>
      )}

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

      {/* ✅ Permission Update Modal */}
      <Modal
        title="Switch User Permission"
        open={isPermissionModalOpen}
        onOk={handlePermissionSubmit}
        onCancel={() => setIsPermissionModalOpen(false)}
        confirmLoading={isPermissionPending}
        width={420}
        okText="Save"
      >
        <Form form={permissionForm} layout="vertical" style={{ marginTop: 10 }}>
          <div style={{ marginBottom: 14, color: "#666", fontSize: 13 }}>
            User: <b>{selectedUser?.first_name || selectedUser?.last_name ? `${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim() : selectedUser?.email}</b>
          </div>
          <Form.Item
            label="Permission Profile"
            name="permissionId"
            help="Select a permission profile to assign or clear permission"
          >
            {permissionsList && permissionsList.length > 0 ? (
              <Select
                placeholder="Select permission profile"
                allowClear
                options={permissionsList.map((p) => ({
                  value: p.id,
                  label: `${p.name || `Permission #${p.id}`} (ID: ${p.id})`,
                }))}
              />
            ) : (
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter Permission ID (e.g. 1, 2, 3...)"
                min={0}
              />
            )}
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
        title={<div><ProfileOutlined style={{ marginRight: 8 }} /> User Notes & Lead Funnel</div>}
        open={isNotesModalOpen}
        onCancel={() => setIsNotesModalOpen(false)}
        footer={null}
        width={520}
      >
        <div style={{ marginTop: 20 }}>
          <div style={{ marginBottom: 24, background: '#f9f9f9', padding: 16, borderRadius: 6 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
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
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Lead Stage / Status</label>
                <Select
                  value={newNoteLeadStatus}
                  onChange={(val) => setNewNoteLeadStatus(val)}
                  style={{ width: "100%" }}
                  options={LEAD_STAGES.map((s) => ({ value: s.value, label: s.label }))}
                />
              </div>
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: 13, color: "#1890ff", fontWeight: 500 }}>
                            {formatDateAndTime(note.note_date || note.date)}
                          </span>
                          {renderLeadStatusTag(note.lead_status || "NC")}
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

      {/* ✅ Column Customization Modal */}
      <Modal
        title={
          <Flex justify="space-between" align="center" style={{ paddingRight: 24 }}>
            <span>Customize Table Columns</span>
            <Button
              type="text"
              size="small"
              icon={<UndoOutlined />}
              onClick={resetColumnsConfig}
            >
              Reset Default
            </Button>
          </Flex>
        }
        open={isColumnModalOpen}
        onCancel={() => setIsColumnModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsColumnModalOpen(false)}>
            Done
          </Button>,
        ]}
        width={450}
      >
        <div style={{ maxHeight: 380, overflowY: "auto", paddingRight: 8, marginTop: 12 }}>
          <List
            size="small"
            dataSource={columnsConfig}
            renderItem={(item, index) => (
              <List.Item
                draggable={!item.locked}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: draggedItemIndex === index ? "#e6f7ff" : "#fafafa",
                  marginBottom: 6,
                  borderRadius: 4,
                  border: draggedItemIndex === index ? "1px dashed #1890ff" : "1px solid #f0f0f0",
                  cursor: item.locked ? "default" : "grab",
                  userSelect: "none",
                  transition: "background 0.2s ease",
                }}
              >
                <Space>
                  <HolderOutlined style={{ color: "#bfbfbf", cursor: item.locked ? "default" : "grab" }} />
                  <Checkbox
                    checked={item.visible !== false}
                    disabled={item.locked}
                    onChange={() => toggleColumnVisibility(item.key)}
                  >
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{item.label}</span>
                  </Checkbox>
                </Space>
              </List.Item>
            )}
          />
        </div>
      </Modal>

      {/* ✅ Kanban Stages Customization Modal */}
      <Modal
        title={
          <Flex justify="space-between" align="center" style={{ paddingRight: 24 }}>
            <span>Customize & Sort Kanban Board Columns</span>
            <Button
              type="text"
              size="small"
              icon={<UndoOutlined />}
              onClick={resetKanbanStagesConfig}
            >
              Reset Default
            </Button>
          </Flex>
        }
        open={isKanbanModalOpen}
        onCancel={() => setIsKanbanModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsKanbanModalOpen(false)}>
            Done
          </Button>,
        ]}
        width={450}
      >
        <div style={{ maxHeight: 380, overflowY: "auto", paddingRight: 8, marginTop: 12 }}>
          <List
            size="small"
            dataSource={kanbanStagesConfig}
            renderItem={(item, index) => (
              <List.Item
                draggable
                onDragStart={(e) => handleKanbanDragStart(e, index)}
                onDragOver={handleKanbanDragOver}
                onDrop={(e) => handleKanbanDrop(e, index)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: draggedKanbanIndex === index ? "#e6f7ff" : "#fafafa",
                  marginBottom: 6,
                  borderRadius: 4,
                  border: draggedKanbanIndex === index ? "1px dashed #1890ff" : "1px solid #f0f0f0",
                  cursor: "grab",
                  userSelect: "none",
                  transition: "background 0.2s ease",
                }}
              >
                <Space>
                  <HolderOutlined style={{ color: "#bfbfbf", cursor: "grab" }} />
                  <Checkbox
                    checked={item.visible !== false}
                    onChange={() => toggleKanbanStageVisibility(item.value)}
                  >
                    <span style={{ fontWeight: 500, fontSize: 13, marginRight: 6 }}>{item.label}</span>
                  </Checkbox>
                </Space>
                {renderLeadStatusTag(item.value)}
              </List.Item>
            )}
          />
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