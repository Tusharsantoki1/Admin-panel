import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Card, Tag, Space, Tooltip, App, Flex, Spin, Input, Popover, Badge, Button, Select } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  ProfileOutlined,
  ClockCircleOutlined,
  EditOutlined,
  LoadingOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { LEAD_STAGES, renderLeadStatusTag, hasUserNotes, formatDateAndTime } from "./UsersPage";
import { fetchUsersList } from "../hooks/useUsersList";
import { useAddNote } from "../hooks/useAddNote";

function KanbanColumn({
  stage,
  searchQuery = "",
  globalFilters = {},
  sortOrder = "desc",
  refreshKey = 0,
  onOpenNotes,
  onOpenFollowup,
  onOpenTrial,
  onOpenGroup,
  onDropUser,
  registerColumnController,
}) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  const isFetchingMoreRef = useRef(false);
  const scrollRef = useRef(null);

  // Stringify filters for stable primitive dependency comparison
  const filtersJson = JSON.stringify(globalFilters);

  // Column local search
  const [columnSearch, setColumnSearch] = useState("");
  const [debouncedColumnSearch, setDebouncedColumnSearch] = useState("");

  // Column local popover filters
  const [colStatusFilter, setColStatusFilter] = useState(undefined);
  const [colMonitoringFilter, setColMonitoringFilter] = useState(undefined);
  const [colGroupFilter, setColGroupFilter] = useState(undefined);

  // Temporary popover state
  const [isColPopoverOpen, setIsColPopoverOpen] = useState(false);
  const [tempColStatus, setTempColStatus] = useState(undefined);
  const [tempColMonitoring, setTempColMonitoring] = useState(undefined);
  const [tempColGroup, setTempColGroup] = useState(undefined);

  const handleOpenColPopover = (open) => {
    if (open) {
      setTempColStatus(colStatusFilter);
      setTempColMonitoring(colMonitoringFilter);
      setTempColGroup(colGroupFilter);
    }
    setIsColPopoverOpen(open);
  };

  const handleApplyColFilters = () => {
    setColStatusFilter(tempColStatus);
    setColMonitoringFilter(tempColMonitoring);
    setColGroupFilter(tempColGroup);
    setIsColPopoverOpen(false);
  };

  const handleResetColFilters = () => {
    setTempColStatus(undefined);
    setTempColMonitoring(undefined);
    setTempColGroup(undefined);
    setColStatusFilter(undefined);
    setColMonitoringFilter(undefined);
    setColGroupFilter(undefined);
    setIsColPopoverOpen(false);
  };

  const colActiveFilterCount =
    (colStatusFilter ? 1 : 0) +
    (colMonitoringFilter ? 1 : 0) +
    (colGroupFilter ? 1 : 0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedColumnSearch(columnSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [columnSearch]);

  const fetchStageData = useCallback(
    async (targetPage, isReset = false) => {
      if (isReset) {
        setLoading(true);
      } else {
        if (isFetchingMoreRef.current) return;
        isFetchingMoreRef.current = true;
        setLoadingMore(true);
      }

      try {
        const parsedGlobalFilters = filtersJson ? JSON.parse(filtersJson) : {};
        const combinedFilters = {
          ...parsedGlobalFilters,
          lead_status: stage.value,
          ...(colStatusFilter && { status: colStatusFilter }),
          ...(colMonitoringFilter && { view_mode: colMonitoringFilter }),
          ...(colGroupFilter && { group: colGroupFilter }),
        };

        const effectiveSearch = [searchQuery, debouncedColumnSearch].filter(Boolean).join(" ").trim();
        if (effectiveSearch) {
          combinedFilters.search = {
            key: ["first_name", "last_name", "email", "phone_number", "group", "referral_code"],
            value: effectiveSearch,
          };
        }

        const res = await fetchUsersList({ page: targetPage, limit: 15, filters: combinedFilters, sortOrder });
        const items = res?.data || [];
        const pagination = res?.pagination || {};
        const totalCount = pagination.total || 0;

        if (isReset) {
          setUsers(items);
          setPage(1);
          setTotal(totalCount);
          setHasMore(items.length > 0 && items.length < totalCount);
        } else {
          setUsers((prev) => {
            const existingIds = new Set(prev.map((u) => u.id));
            const newItems = items.filter((u) => !existingIds.has(u.id));
            const updated = [...prev, ...newItems];
            setHasMore(items.length > 0 && updated.length < totalCount);
            return updated;
          });
          setPage(targetPage);
          setTotal(totalCount);
        }
      } catch (e) {
        console.error(`Failed to fetch leads for stage ${stage.value}`, e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isFetchingMoreRef.current = false;
      }
    },
    [filtersJson, searchQuery, debouncedColumnSearch, colStatusFilter, colMonitoringFilter, colGroupFilter, sortOrder, stage.value]
  );

  // Stable initial load & reload on filter/search/refreshKey change
  useEffect(() => {
    fetchStageData(1, true);
  }, [stage.value, searchQuery, debouncedColumnSearch, colStatusFilter, colMonitoringFilter, colGroupFilter, filtersJson, sortOrder, refreshKey, fetchStageData]);

  const loadMoreData = () => {
    if (loading || loadingMore || !hasMore || isFetchingMoreRef.current) return;
    fetchStageData(page + 1, false);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 40) {
      if (!loading && !loadingMore && hasMore && !isFetchingMoreRef.current) {
        loadMoreData();
      }
    }
  };

  const fetchStageDataRef = useRef(fetchStageData);
  useEffect(() => {
    fetchStageDataRef.current = fetchStageData;
  }, [fetchStageData]);

  useEffect(() => {
    if (registerColumnController) {
      registerColumnController(stage.value, {
        removeUser: (userId) => {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          setTotal((prev) => Math.max(0, prev - 1));
        },
        addUser: (newUser) => {
          setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
          setTotal((prev) => prev + 1);
        },
        refetchColumn: () => fetchStageDataRef.current(1, true),
      });
    }
  }, [registerColumnController, stage.value]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    onDropUser(stage.value);
  };

  const columnFilterPopoverContent = (
    <div style={{ width: 230, padding: "4px 0" }}>
      <div style={{ fontWeight: 600, fontSize: 12, color: "#111", marginBottom: 8, borderBottom: "1px solid #f0f0f0", paddingBottom: 4 }}>
        Filter {stage.value} Column
      </div>

      <Space direction="vertical" style={{ width: "100%" }} size={8}>
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#666", marginBottom: 2 }}>
            Status
          </label>
          <Select
            allowClear
            size="small"
            placeholder="All Statuses"
            value={tempColStatus}
            onChange={(val) => setTempColStatus(val)}
            style={{ width: "100%" }}
            options={[
              { label: "Active", value: "active" },
              { label: "Trial", value: "trial" },
              { label: "Expired", value: "expired" },
            ]}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#666", marginBottom: 2 }}>
            Monitoring
          </label>
          <Select
            allowClear
            size="small"
            placeholder="All Monitoring"
            value={tempColMonitoring}
            onChange={(val) => setTempColMonitoring(val)}
            style={{ width: "100%" }}
            options={[
              { value: "expire_10", label: "Expire in 10 days" },
              { value: "expired_30", label: "Expired in 30 days" },
              { value: "followup", label: "Follow up date" },
            ]}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#666", marginBottom: 2 }}>
            Group
          </label>
          <Input
            allowClear
            size="small"
            placeholder="Filter group..."
            value={tempColGroup}
            onChange={(e) => setTempColGroup(e.target.value ? e.target.value : undefined)}
            style={{ width: "100%" }}
          />
        </div>

        <Flex justify="space-between" align="center" style={{ marginTop: 6, paddingTop: 8, borderTop: "1px solid #f0f0f0" }}>
          <Button size="small" onClick={handleResetColFilters}>
            Reset
          </Button>
          <Button size="small" type="primary" onClick={handleApplyColFilters}>
            Confirm
          </Button>
        </Flex>
      </Space>
    </div>
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        width: 290,
        background: isDragOver ? "#e6f7ff" : "#f4f5f7",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: isDragOver ? "2px dashed #1890ff" : "1px solid #e2e8f0",
        transition: "all 0.2s ease",
      }}
    >
      {/* Column Header */}
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
          borderTopLeftRadius: 7,
          borderTopRightRadius: 7,
        }}
      >
        <Flex align="center" gap={6}>
          {renderLeadStatusTag(stage.value)}
          <span style={{ fontWeight: 600, fontSize: 13, color: "#333" }}>
            {stage.label.split("(")[0].trim()}
          </span>
        </Flex>

        <Flex align="center" gap={6}>
          <Popover
            content={columnFilterPopoverContent}
            trigger="click"
            open={isColPopoverOpen}
            onOpenChange={handleOpenColPopover}
            placement="bottomRight"
          >
            <Badge count={colActiveFilterCount} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                size="small"
                icon={<FilterOutlined style={{ color: colActiveFilterCount > 0 ? "#1890ff" : "#8c8c8c" }} />}
              />
            </Badge>
          </Popover>
          <Tag color="blue" style={{ borderRadius: 10, margin: 0, fontWeight: 600 }}>
            {total}
          </Tag>
        </Flex>
      </div>

      {/* Column Mini Search Filter Input */}
      <div style={{ padding: "6px 10px", background: "#fff", borderBottom: "1px solid #e8e8e8" }}>
        <Input
          placeholder={`Filter ${stage.value}...`}
          prefix={<SearchOutlined style={{ color: "#bfbfbf", fontSize: 12 }} />}
          size="small"
          allowClear
          value={columnSearch}
          onChange={(e) => setColumnSearch(e.target.value)}
          style={{ borderRadius: 4, fontSize: 12 }}
        />
      </div>

      {/* Cards Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="small" tip="Loading leads..." />
          </div>
        ) : users.length > 0 ? (
          users.map((user) => {
            const hasNotes = hasUserNotes(user.notes);

            return (
              <Card
                key={user.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", user.id.toString());
                  window.__currentKanbanDragData = { userId: user.id, fromStage: stage.value, user };
                }}
                size="small"
                hoverable
                style={{
                  borderRadius: 6,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  cursor: "grab",
                  border: "1px solid #e8e8e8",
                }}
                bodyStyle={{ padding: 12 }}
              >
                {/* User Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <Link
                    to={`/user/${user.id}`}
                    style={{ fontWeight: 600, color: "#1890ff", fontSize: 14, textDecoration: "none" }}
                  >
                    {user.first_name || user.last_name
                      ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                      : `User #${user.id}`}
                  </Link>
                  <Tag color={user.status === "active" ? "green" : "orange"} style={{ fontSize: 10, margin: 0 }}>
                    {user.status || "N/A"}
                  </Tag>
                </div>

                {/* Email & Phone */}
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                  <MailOutlined style={{ marginRight: 6, color: "#8c8c8c" }} />
                  <span style={{ wordBreak: "break-all" }}>{user.email || "--"}</span>
                </div>

                {user.phone_number && (
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                    <PhoneOutlined style={{ marginRight: 6, color: "#8c8c8c" }} />
                    <span>{user.phone_number}</span>
                  </div>
                )}

                {/* Group, Referral & Dates */}
                <Flex align="center" justify="space-between" style={{ marginTop: 8, paddingTop: 6, borderTop: "1px dashed #f0f0f0" }}>
                  <Space size={4} wrap>
                    <span style={{ fontSize: 11, color: "#8c8c8c" }}>Group:</span>
                    <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>
                      {user.group || "Default"}
                    </Tag>
                    {user.referral_code && (
                      <>
                        <span style={{ fontSize: 11, color: "#8c8c8c", marginLeft: 2 }}>Ref:</span>
                        <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>
                          {user.referral_code}
                        </Tag>
                      </>
                    )}
                  </Space>

                  {user.followup && (
                    <Tooltip title={`Follow-up: ${formatDateAndTime(user.followup)}`}>
                      <Tag color="warning" icon={<CalendarOutlined />} style={{ fontSize: 10, margin: 0 }}>
                        Follow-up
                      </Tag>
                    </Tooltip>
                  )}
                </Flex>

                {/* Action Bar */}
                <Flex align="center" justify="flex-end" gap={10} style={{ marginTop: 10, paddingTop: 6, borderTop: "1px solid #f5f5f5" }}>
                  <Tooltip title="Extend Trial">
                    <ClockCircleOutlined
                      style={{ cursor: "pointer", fontSize: 14, color: "#595959" }}
                      onClick={() => onOpenTrial && onOpenTrial(user)}
                    />
                  </Tooltip>
                  <Tooltip title="Follow-up Date">
                    <CalendarOutlined
                      style={{ cursor: "pointer", fontSize: 14, color: user.followup ? "#fa8c16" : "#595959" }}
                      onClick={() => onOpenFollowup && onOpenFollowup(user)}
                    />
                  </Tooltip>
                  <Tooltip title={hasNotes ? "View Notes (Has Notes)" : "Add Note"}>
                    <ProfileOutlined
                      style={{
                        cursor: "pointer",
                        fontSize: 14,
                        color: hasNotes ? "#1890ff" : "#bfbfbf",
                      }}
                      onClick={() => onOpenNotes && onOpenNotes(user)}
                    />
                  </Tooltip>
                  <Tooltip title="Edit Group">
                    <EditOutlined
                      style={{ cursor: "pointer", fontSize: 14, color: "#722ed1" }}
                      onClick={() => onOpenGroup && onOpenGroup(user)}
                    />
                  </Tooltip>
                </Flex>
              </Card>
            );
          })
        ) : (
          <div style={{ textAlign: "center", color: "#bfbfbf", padding: "40px 10px", fontSize: 12 }}>
            No leads in this stage
          </div>
        )}

        {loadingMore && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <Spin size="small" indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanUsers({
  searchQuery = "",
  globalFilters = {},
  sortOrder = "desc",
  refreshKey = 0,
  stagesConfig = [],
  onOpenNotes,
  onOpenFollowup,
  onOpenTrial,
  onOpenGroup,
}) {
  const { message } = App.useApp();
  const { mutateAsync: addNote } = useAddNote();
  const controllersRef = useRef({});

  const activeStages = useMemo(() => {
    const config = Array.isArray(stagesConfig) && stagesConfig.length > 0 ? stagesConfig : LEAD_STAGES;
    return config.filter((s) => s.visible !== false);
  }, [stagesConfig]);

  const registerColumnController = useCallback((stageValue, controller) => {
    controllersRef.current[stageValue] = controller;
  }, []);

  const handleDropUser = async (targetStage) => {
    const dragData = window.__currentKanbanDragData;
    window.__currentKanbanDragData = null;

    if (!dragData) return;
    const { userId, fromStage, user } = dragData;
    if (fromStage === targetStage) return;

    if (controllersRef.current[fromStage]) {
      controllersRef.current[fromStage].removeUser(userId);
    }
    const updatedUser = { ...user, lead_status: targetStage };
    if (controllersRef.current[targetStage]) {
      controllersRef.current[targetStage].addUser(updatedUser);
    }

    try {
      const currentTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
      await addNote({
        user_id: userId,
        description: `Lead status updated to ${targetStage} via Kanban drag & drop`,
        note_date: currentTime,
        lead_status: targetStage,
      });
      message.success(`Status for ${user.first_name || "User"} updated to ${targetStage}`);
    } catch (err) {
      message.error("Failed to update lead status");
      if (controllersRef.current[fromStage]) controllersRef.current[fromStage].refetchColumn();
      if (controllersRef.current[targetStage]) controllersRef.current[targetStage].refetchColumn();
    }
  };

  return (
    <div style={{ height: "calc(100vh - 125px)", overflowX: "auto", padding: "12px 16px" }}>
      <div style={{ display: "flex", gap: 14, minWidth: "max-content", height: "100%" }}>
        {activeStages.map((stage) => (
          <KanbanColumn
            key={stage.value}
            stage={stage}
            searchQuery={searchQuery}
            globalFilters={globalFilters}
            sortOrder={sortOrder}
            refreshKey={refreshKey}
            onOpenNotes={onOpenNotes}
            onOpenFollowup={onOpenFollowup}
            onOpenTrial={onOpenTrial}
            onOpenGroup={onOpenGroup}
            registerColumnController={registerColumnController}
            onDropUser={handleDropUser}
          />
        ))}
      </div>
    </div>
  );
}
