import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Tag, Descriptions, Table, App, Flex, Tooltip, Form, DatePicker, Modal, Input, Timeline, Typography, InputNumber } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  CalendarOutlined,
  ProfileOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useUserdetail } from "../hooks/useUserdetail";
import { useUpdateFollowup } from "../hooks/useUpdateFollowup";
import { useAddNote } from "../hooks/useAddNote";
import { useTrialExtend } from "../hooks/useTrialExtend";
import { useTrialdetail } from "../hooks/useTrialdetail";
import { useQueryClient } from "@tanstack/react-query";
import { formatDateAndTime, renderDateTimeWithHover } from "./UsersPage";

const { Text } = Typography;

const VerifiedIcon = ({ value }) =>
  value ? (
    <CheckCircleFilled style={{ color: "#52c41a", fontSize: 13 }} />
  ) : (
    <CloseCircleFilled style={{ color: "#ff4d4f", fontSize: 13 }} />
  );

const Cell = ({ value, style = {} }) => {
  const stringValue = value != null ? String(value) : "";
  const isGMT = stringValue?.includes("GMT");

  return (
    <Tooltip title={isGMT ? formatDateAndTime(value) : value} placement="topLeft">
      <span
        style={{
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
          ...style,
        }}
      >
        {value != null && value !== ""
          ? isGMT
            ? formatDateAndTime(value)
            : value
          : "—"}
      </span>
    </Tooltip>
  );
};

const renderDI = (label, value, span) => (
  <Descriptions.Item label={label} span={span} key={label}>
    <Cell value={value} />
  </Descriptions.Item>
);

const renderBI = (label, value) => (
  <Descriptions.Item label={label} key={label}>
    <VerifiedIcon value={!!value} />
  </Descriptions.Item>
);

export default function UserDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { data: detail, refetch } = useUserdetail(Number(id));

  // --- API Hooks ---
  const { mutateAsync: updateFollowup, isPending: isFollowupPending } = useUpdateFollowup();
  const { mutateAsync: addNote, isPending: isNotePending } = useAddNote();
  const { mutateAsync: trialExtend, isPending: isTrialPending } = useTrialExtend();
  const { data: trial_activates, isLoading: trial_history_loading, refetch: refetchTrialHistory } = useTrialdetail(Number(id));

  // --- States & Forms ---
  const [followupForm] = Form.useForm();
  const [trialForm] = Form.useForm();
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteDate, setNewNoteDate] = useState(dayjs());

  useEffect(() => {
    queryClient.setQueryData(["title"], { title: "Global Search", count: "" });
  }, [queryClient]);

  const userData = detail?.user;
  const brokers = detail?.brokers || [];
  const paymentHistory = detail?.paymentHistory || [];
  const plan = detail?.plan || {};
  const settings = detail?.settings || {};

  // Safely parse notes
  const parsedNotes = useMemo(() => {
    if (!userData?.notes) return [];
    try {
      return typeof userData.notes === 'string' ? JSON.parse(userData.notes) : userData.notes;
    } catch (e) {
      return [];
    }
  }, [userData?.notes]);

  // --- Handlers ---
  const handleOpenFollowup = () => {
    followupForm.setFieldsValue({
      followup: userData?.followup ? dayjs(userData.followup) : dayjs().add(2, 'hour'),
    });
    setIsFollowupModalOpen(true);
  };

  const handleFollowupSubmit = async () => {
    try {
      const values = await followupForm.validateFields();
      const formattedDate = values.followup ? values.followup.format("YYYY-MM-DD HH:mm:ss") : null;
      await updateFollowup({ user_id: Number(id), followup: formattedDate });
      message.success("Follow-up date updated successfully");
      setIsFollowupModalOpen(false);
      if (refetch) refetch();
    } catch (err) {
      if (!err.errorFields) message.error("Failed to update follow-up date");
    }
  };

  const handleAddNoteSubmit = async () => {
    if (!newNoteText.trim()) return message.warning("Note description cannot be empty.");
    try {
      const formattedDate = newNoteDate ? newNoteDate.format("YYYY-MM-DD HH:mm:ss") : dayjs().format("YYYY-MM-DD HH:mm:ss");
      await addNote({
        user_id: Number(id),
        description: newNoteText,
        note_date: formattedDate,
      });
      message.success("Note added successfully");
      setNewNoteText("");
      setNewNoteDate(dayjs());
      if (refetch) refetch();
    } catch (err) {
      message.error("Failed to add note.");
    }
  };

  const handleTrialSubmit = async () => {
    try {
      const values = await trialForm.validateFields();
      await trialExtend({
        days: values.days,
        brokers: values.brokers,
        user_id: Number(id),
      });
      message.success(`Trial extended successfully by ${values.days} days`);
      trialForm.resetFields();
      if (refetch) refetch();
      if (refetchTrialHistory) refetchTrialHistory();
      queryClient.invalidateQueries(["user", "trial", Number(id)]);
    } catch (err) {
      if (!err.errorFields) message.error("Failed to extend trial");
    }
  };

  const descProps = {
    size: "small",
    bordered: true,
    column: { xxl: 4, xl: 4, lg: 4, md: 2, sm: 2, xs: 1 },
    labelStyle: {
      fontWeight: 500, color: "#555", fontSize: 12, background: "#fafafa",
      width: 140, minWidth: 140, maxWidth: 140, whiteSpace: "nowrap",
      verticalAlign: "middle", padding: "6px 10px",
    },
    contentStyle: {
      fontSize: 12, color: "#1a1a1a", overflow: "hidden",
      verticalAlign: "middle", padding: "6px 10px",
    },
  };

  let brokerAddon = [];
  try { brokerAddon = JSON.parse(userData?.broker_addon || "[]"); } catch (_) { }

  const isPlanActive = userData?.expiryDate ? new Date(userData?.expiryDate) > new Date() : null;

  let featureList = [];
  try { featureList = JSON.parse(plan?.featureLists || "[]"); } catch (_) { }

  // Columns for Tables
  const trialHistoryColumns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Days',
      dataIndex: 'days',
      key: 'days',
      render: (days) => <Tag color="blue">+{days} Days</Tag>,
    },
    {
      title: 'Brokers',
      dataIndex: 'brokers',
      key: 'brokers',
    },
    {
      title: 'By (ID)',
      dataIndex: 'createdById',
      key: 'createdById',
      render: (id) => <Text type="secondary">{id}</Text>
    }
  ];

  const brokerColumns = [
    { title: "Sr.", key: "sr", width: 45, fixed: "left", render: (_, __, i) => i + 1 },
    { title: "Broker", dataIndex: "brokerName", width: 90, ellipsis: true, render: (v) => <b>{v}</b> },
    { title: "Server", dataIndex: "brokerServer", width: 110, ellipsis: true },
    { title: "User ID", dataIndex: "interactiveUserId", width: 90, ellipsis: true },
    { title: "Client Code", dataIndex: "client_code", width: 90, ellipsis: true, render: (v) => v || "—" },
    { title: "Role", dataIndex: "role", width: 80, render: (v) => <Tag color={v === "primary" ? "blue" : "default"} style={{ fontSize: 11 }}>{v}</Tag> },
    { title: "Multiplier", dataIndex: "multiplier", width: 80, align: "center" },
    { title: "Copy Trade", dataIndex: "copyTradeStatus", width: 85, align: "center", render: (v) => <VerifiedIcon value={v === 1} /> },
    { title: "Is Client", dataIndex: "isClient", width: 75, align: "center", render: (v) => <VerifiedIcon value={v === 1} /> },
    { title: "Is Dealer", dataIndex: "isDealer", width: 75, align: "center", render: (v) => <VerifiedIcon value={v === 1} /> },
    { title: "Investor", dataIndex: "isInvestorClient", width: 70, align: "center", render: (v) => <VerifiedIcon value={v === 1} /> },
    { title: "Rev. Copy", dataIndex: "isReverseCopy", width: 80, align: "center", render: (v) => <VerifiedIcon value={v === 1} /> },
    { title: "Dir. Copy", dataIndex: "isDirectCopy", width: 75, align: "center", render: (v) => <VerifiedIcon value={v === 1} /> },
    { title: "Bal. Client", dataIndex: "isBalanceForClient", width: 85, align: "center", render: (v) => <VerifiedIcon value={v === 1} /> },
    { title: "Binary Upd.", dataIndex: "isBinaryUpdated", width: 90, align: "center", render: (v) => <VerifiedIcon value={v === 1} /> },
    { title: "Rate Limit", dataIndex: "rate_limit", width: 80, align: "center" },
    { title: "SL", dataIndex: "sl", width: 55, align: "center" },
    { title: "Target", dataIndex: "target", width: 65, align: "center" },
    { title: "Nifty ×", dataIndex: "nifty_multiplier", width: 65, align: "center", render: (v) => v ?? "—" },
    { title: "Sensex ×", dataIndex: "sensex_multiplier", width: 70, align: "center", render: (v) => v ?? "—" },
    { title: "Interactive API Key", dataIndex: "InteractiveApiKey", width: 140, ellipsis: true, render: (v) => v || "—" },
    { title: "Interactive Secret", dataIndex: "InteractiveSecretKey", width: 140, ellipsis: true, render: (v) => v || "—" },
    { title: "Interactive URL", dataIndex: "InteractiveUrl", width: 180, ellipsis: true, render: (v) => v || "—" },
    { title: "Market API Key", dataIndex: "MarketApiKey", width: 130, ellipsis: true, render: (v) => v || "—" },
    { title: "Market Secret", dataIndex: "MarketSecretKey", width: 130, ellipsis: true, render: (v) => v || "—" },
    { title: "Market URL", dataIndex: "MarketUrl", width: 180, ellipsis: true, render: (v) => v || "—" },
    { title: "Market User ID", dataIndex: "marketUserId", width: 110, ellipsis: true, render: (v) => v || "—" },
    { title: "Tag", dataIndex: "tag", width: 70, ellipsis: true, render: (v) => v || "—" },
    { title: "Deleted", dataIndex: "deleted", width: 65, align: "center", render: (v) => <VerifiedIcon value={v === 1} /> },
    { title: "Created At", dataIndex: "createdAt", width: 175, render: renderDateTimeWithHover, ellipsis: true },
    { title: "Updated At", dataIndex: "updatedAt", width: 175, render: renderDateTimeWithHover, ellipsis: true },
  ];

  const paymentColumns = [
    { title: "Sr.", key: "sr", width: 45, fixed: "left", render: (_, __, i) => i + 1 },
    { title: "Order ID", dataIndex: "order_id", width: 160, ellipsis: true, render: (v) => v || "—" },
    { title: "Payment ID", dataIndex: "paymentId", width: 160, ellipsis: true, render: (v) => v || "—" },
    { title: "Status", dataIndex: "paymentStatus", width: 90, render: (v) => <b style={{ color: v === "captured" ? "#52c41a" : "#ff4d4f" }}>{v || "—"}</b> },
    { title: "Method", dataIndex: "paymentMethod", width: 75, render: (v) => v ? <Tag style={{ fontSize: 11 }}>{v}</Tag> : "—" },
    { title: "Plan ID", dataIndex: "planId", width: 65, align: "center" },
    { title: "Brokers", dataIndex: "brokers", width: 65, align: "center", render: (v) => v ?? "—" },
    { title: "Period", dataIndex: "subscriptionPeriod", width: 80, ellipsis: true },
    { title: "Sub. Days", dataIndex: "subscriptionDays", width: 80, align: "center", render: (v) => v ?? "—" },
    { title: "Offer Type", dataIndex: "offerType", width: 85, ellipsis: true, render: (v) => v || "—" },
    { title: "Coupon", dataIndex: "couponCode", width: 100, render: (v) => v ? <Tag color="purple" style={{ fontSize: 11 }}>{v}</Tag> : "—" },
    { title: "Coupon Val", dataIndex: "couponValue", width: 85, align: "right", render: (v) => v ? `₹${v}` : "—" },
    { title: "Sub Total", dataIndex: "subTotalAmount", width: 85, align: "right", render: (v) => `₹${v}` },
    { title: "Discount", dataIndex: "discountAmount", width: 85, align: "right", render: (v) => `₹${v}` },
    { title: "After Disc.", dataIndex: "afterDiscountAmount", width: 90, align: "right", render: (v) => `₹${v}` },
    { title: "Tax", dataIndex: "taxAmount", width: 65, align: "right", render: (v) => `₹${v}` },
    { title: "Total", dataIndex: "totalAmount", width: 75, align: "right", render: (v) => <b>₹{v}</b> },
    { title: "Txn Type", dataIndex: "transactionType", width: 90, ellipsis: true, render: (v) => v || "—" },
    { title: "Activation Date", dataIndex: "activationDate", width: 175, render: renderDateTimeWithHover, ellipsis: true },
    { title: "Expiry Date", dataIndex: "expiryDate", width: 175, render: renderDateTimeWithHover, ellipsis: true },
    { title: "Addon Days", dataIndex: "addonDays", width: 85, align: "center", render: (v) => v ?? "—" },
    { title: "Created At", dataIndex: "created_at", width: 175, render: renderDateTimeWithHover, ellipsis: true },
    { title: "Updated At", dataIndex: "updated_at", width: 175, render: renderDateTimeWithHover, ellipsis: true },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ── STICKY HEADER ── */}
      <Flex
        justify="space-between"
        align="center"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#fff",
          padding: "4px 20px",
          height: 38,
          borderBottom: "1px solid #f0f0f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          flexShrink: 0
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ color: "#003eb3", fontWeight: 500, paddingLeft: 0 }}
        >
          Back
        </Button>
      </Flex>

      {/* ── MAIN SCROLLABLE CONTENT ── */}
      <div style={{ padding: "16px 10px" }}>

        {/* ── CUSTOMER INFORMATION ── */}
        <SectionCard
          title="Customer Information"
          statusLabel={userData?.status}
          actions={
            <Button size="small" type="primary" ghost icon={<CalendarOutlined />} onClick={handleOpenFollowup}>
              {userData?.followup ? "Update Follow-up" : "Set Follow-up"}
            </Button>
          }
        >
          <Descriptions {...descProps}>
            {renderDI("User ID", userData?.id)}
            {renderDI("First Name", userData?.first_name)}
            {renderDI("Last Name", userData?.last_name)}
            <Descriptions.Item label="Email">
              <span style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden" }}>
                <Cell value={userData?.email} style={{ flex: "1 1 0", minWidth: 0 }} />
                <VerifiedIcon value={userData?.isEmailVerified === 1} />
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Cell value={userData?.phone_number} />
                <VerifiedIcon value={userData?.isMobileVerified === 1} />
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              <Tag color="blue" style={{ fontSize: 11 }}>{userData?.role || "—"}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <span style={{ fontWeight: 600, color: userData?.status === "active" ? "#52c41a" : "#ff4d4f" }}>
                {userData?.status || "—"}
              </span>
            </Descriptions.Item>
            {renderBI("Is Active", userData?.isActive === 1)}
            {renderBI("Is Purchasable", userData?.isPurchasable === 1)}
            {renderBI("Waitlist Joined", userData?.waitlist_joined === 1)}
            <Descriptions.Item label="Follow Up Date">
              <span style={{ fontWeight: 600, color: userData?.followup ? "#fa8c16" : "inherit" }}>
                {userData?.followup ? formatDateAndTime(userData?.followup) : "—"}
              </span>
            </Descriptions.Item>
            {renderDI("Permission ID", userData?.permissionId)}
            {renderDI("Plan ID", userData?.planId)}
            {renderDI("Group", userData?.group)}
            {renderDI("OTP", userData?.otp)}
            {renderDI("OTP Expiry", userData?.otp_expiration)}
            {renderDI("Send Email Limit", userData?.send_email_limit)}
            {renderDI("Trial Date", userData?.trialDate)}
            {renderDI("Trial Expiry", userData?.trialExpiryDate)}
            {renderDI("Created At", userData?.created_at)}
            {renderDI("Updated At", userData?.updated_at)}
          </Descriptions>
        </SectionCard>

        {/* ── SUBSCRIPTION DETAIL ── */}
        <SectionCard title="Subscription Detail">
          <Descriptions {...descProps}>
            {renderDI("Plan Name", plan?.name)}
            {renderDI("Plan Code", plan?.code)}
            {renderDI("Plan Type", plan?.planType)}
            {renderDI("Plan Price", plan?.price ? `₹${plan?.price}` : null)}
            {renderDI("Sub. Period", plan?.subscriptionPeriod)}
            {renderDI("Broker Number", plan?.brokerNumber)}
            {renderBI("Is Active", plan?.isActive === 1)}
            {renderDI("Description", plan?.description)}
            {renderDI("Activation Date", userData?.activateDate)}
            {renderDI("Expiry Date", userData?.expiryDate)}
            {renderDI("Renew Date", userData?.renewDate)}
            <Descriptions.Item label="Plan Status">
              {isPlanActive === null ? "—" : (
                <b style={{ color: isPlanActive ? "#52c41a" : "#ff4d4f" }}>
                  {isPlanActive ? "Active" : "Expired"}
                </b>
              )}
            </Descriptions.Item>
            {renderDI("Active Broker", userData?.active_broker)}
            {renderDI("GST No", userData?.gstNo)}
            {renderDI("Plan Created At", plan?.created_at)}
            {renderDI("Plan Updated At", plan?.updated_at)}
            <Descriptions.Item label="Broker Addon" span={4}>
              <Cell
                value={
                  brokerAddon.length > 0
                    ? brokerAddon.map((b) => `Brokers: ${b.brokers} | Days: ${b.days} | Plan: ${b.planId} | Expiry: ${b.expiryDate}`).join("  •  ")
                    : null
                }
              />
            </Descriptions.Item>
            <Descriptions.Item label="Feature List" span={4}>
              <Cell value={featureList.join(" • ")} />
            </Descriptions.Item>
          </Descriptions>
        </SectionCard>

        {/* ── NOTES TIMELINE SECTION ── */}
        <SectionCard title={<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ProfileOutlined /> User Notes</div>}>
          <div style={{ display: 'flex', gap: 24, flexDirection: 'row', alignItems: 'flex-start' }}>
            {/* Note Input Box */}
            <div style={{ flex: 1, background: '#f9f9f9', padding: 16, borderRadius: 6, border: '1px solid #f0f0f0' }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Note Date & Time</label>
                <DatePicker
                  showTime
                  value={newNoteDate}
                  onChange={(date) => setNewNoteDate(date)}
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: "100%", maxWidth: 250 }}
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

            {/* Timeline */}
            <div style={{ flex: 1, maxHeight: 220, overflowY: 'auto', paddingRight: 10 }}>
              {parsedNotes.length > 0 ? (
                <Timeline
                  style={{ marginTop: 10 }}
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
                <div style={{ textAlign: 'center', color: '#bfbfbf', padding: '40px 0', border: '1px dashed #d9d9d9', borderRadius: 6 }}>
                  No notes found for this user.
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── TRIAL MANAGEMENT & ACTIVATION HISTORY ── */}
        <SectionCard title={<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ExperimentOutlined /> Trial Management & Activation History</div>}>
          <div style={{ display: 'flex', gap: 24, flexDirection: 'row', alignItems: 'flex-start' }}>

            {/* Trial Extend Form */}
            <div style={{ flex: '0 0 280px', background: '#f9f9f9', padding: 16, borderRadius: 6, border: '1px solid #f0f0f0' }}>
              <h4 style={{ marginTop: 0, marginBottom: 16, color: '#333', fontWeight: 600 }}>Extend User Trial</h4>
              <Form form={trialForm} layout="vertical" initialValues={{ days: 15, brokers: 1 }}>
                <Form.Item label="Trial Days" name="days" rules={[{ required: true, message: "Required" }, { type: "number", min: 1, max: 31 }]}>
                  <InputNumber min={1} max={31} style={{ width: "100%" }} placeholder="Max 31 days" />
                </Form.Item>
                <Form.Item label="Allowed Brokers" name="brokers" rules={[{ required: true, message: "Required" }, { type: "number", min: 1, max: 10 }]}>
                  <InputNumber min={1} max={10} style={{ width: "100%" }} placeholder="Max 10 brokers" />
                </Form.Item>
                <Button type="primary" block loading={isTrialPending} onClick={handleTrialSubmit}>
                  Extend Trial
                </Button>
              </Form>
            </div>

            {/* Activation History Table */}
            <div style={{ flex: 1, overflowX: 'auto', background: '#fff', borderRadius: 6 }}>
              <h4 style={{ marginTop: 0, marginBottom: 12, color: '#333', fontWeight: 600 }}>Activation History</h4>
              <Table
                dataSource={trial_activates?.data || []}
                rowKey="id"
                size="small"
                bordered
                loading={trial_history_loading}
                pagination={{ pageSize: 5 }}
                columns={trialHistoryColumns}
                style={{ fontSize: 12 }}
              />
            </div>
          </div>
        </SectionCard>

        {/* ── LOCATION & ACCOUNT DETAIL ── */}
        <SectionCard title="Location & Account Detail">
          <Descriptions {...descProps}>
            {renderDI("City", userData?.city)}
            {renderDI("State", userData?.state)}
            {renderDI("Country", userData?.country)}
            {renderDI("GST No", userData?.gstNo)}
          </Descriptions>
        </SectionCard>

        {/* ── USER SETTINGS ── */}
        <SectionCard title="User Settings">
          <Descriptions {...descProps}>
            {renderDI("Settings ID", settings?.id)}
            {renderDI("Symbol", settings?.symbol)}
            {renderDI("Theme", settings?.theme_mode)}
            {renderDI("Product Type", settings?.productType)}
            {renderDI("Open Order Type", settings?.open_order_type)}
            {renderBI("Paper Mode", settings?.isPaperMode === 1)}
            {renderBI("Net Wise", settings?.isNetWise === 1)}
            {renderBI("Lot Wise Add", settings?.isLotWiseAdd === 1)}
            {renderBI("Lot Wise Pos.", settings?.isLotWisePositions === 1)}
            {renderBI("Full Tbl Scroll", settings?.isFullTableScroll === 1)}
            {renderBI("Sell First", settings?.isSellFirst === 1)}
            {renderBI("Is Hedge", settings?.is_hedge === 1)}
            {renderBI("Is Trailing", settings?.is_trailing === 1)}
            {renderBI("Auto Reconcile", settings?.autoReconcile === 1)}
            {renderBI("Auto Pend. Rec.", settings?.autoPendingReconcile === 1)}
            {renderDI("Reconcile After", settings?.reconcileAfter)}
            {renderDI("Nifty Def. Qty", settings?.nifty_default_qty)}
            {renderDI("Sensex Def. Qty", settings?.sensex_default_qty)}
            {renderDI("Lot Multiplier", settings?.lot_multiplier)}
            {renderDI("Buy Multiplier", settings?.buy_multiplier)}
            {renderDI("Sell Multiplier", settings?.sell_multiplier)}
            {renderDI("Max Quantity", settings?.max_quantity)}
            {renderDI("Max Common Qty", settings?.max_common_qty)}
            {renderDI("Max Nifty Qty", settings?.max_nifty_qty)}
            {renderDI("Max Sensex Qty", settings?.max_sensex_qty)}
            {renderDI("Max Strike", settings?.max_strike || "—")}
            {renderDI("Strike Range", settings?.strike_range)}
            {renderDI("CEPE Diff", settings?.cepeDiff)}
            {renderDI("SL Type", settings?.sl_type)}
            {renderDI("MTM SL Type", settings?.mtm_sl_type)}
            {renderDI("MTM Target Type", settings?.mtm_target_type)}
            {renderDI("Target Type", settings?.target_type)}
            {renderDI("Predefined SL", settings?.predefined_sl)}
            {renderDI("Predefined Target", settings?.predefined_target)}
            {renderDI("Pred. MTM SL", settings?.predefined_mtm_sl)}
            {renderDI("Pred. MTM Target", settings?.predefined_mtm_target)}
            {renderDI("SL Quantity", settings?.sl_quantity)}
            {renderDI("Target Quantity", settings?.target_quantity)}
            {renderBI("SL Broker", settings?.sl_broker === 1)}
            {renderDI("Trail MTM Amt", settings?.trail_mtm_amount)}
            {renderDI("Trail MTM Start", settings?.trail_mtm_start_point)}
            {renderDI("Trail SL Amt", settings?.trail_sl_amount)}
            {renderDI("Trail SL Start", settings?.trail_sl_start_point)}
            {renderDI("Limit Price", settings?.limit_price)}
            {renderDI("Rate Limit", settings?.rate_limit)}
            {renderDI("Retry Order", settings?.retryOrder)}
            {renderDI("Retry Self Trade", settings?.retrySelfTradeOrder)}
            {renderDI("Order Cooldown", settings?.order_action_cooldown)}
            {renderDI("Exit All Cooldown", settings?.exit_all_cooldown)}
            {renderDI("Copy Delay", settings?.copyDelay)}
            {renderDI("Hedge Interval", settings?.hedge_interval)}
            {renderBI("Hedge On Pos Add", settings?.hedge_on_position_add === 1)}
            {renderDI("Nifty Interval", settings?.nifty_interval)}
            {renderDI("BankNifty Intv.", settings?.bankNifty_interval)}
            {renderDI("Sensex Interval", settings?.sensex_interval)}
            {renderDI("Nifty Hedge R/O", settings?.nifty_hedge_roundoff)}
            {renderDI("Sensex Hedge R/O", settings?.sensex_hedge_roundoff)}
            {renderDI("Initial Move To", settings?.initial_move_to)}
            {renderDI("MoveTo Org Intv.", settings?.moveToOrginalInterval)}
            {renderDI("Mkt Limit Modify", settings?.market_limit_modify_count)}
            {renderDI("Order Slice Lot", settings?.order_slice_lot)}
            {renderDI("Quantity Mode", settings?.quantity_mode)}
            {renderBI("Disable Primary", settings?.disable_primary === 1)}
            {renderBI("System Notif.", settings?.systemNotifications === 1)}
            {renderBI("Deleted", !!settings?.deleted)}
          </Descriptions>
        </SectionCard>

        {/* ── BROKER DETAIL ── */}
        <SectionCard title="Broker Detail">
          <Table
            columns={brokerColumns}
            dataSource={brokers.map((b) => ({ ...b, key: b.id }))}
            rowKey="key"
            size="small"
            bordered
            pagination={false}
            scroll={{ x: "max-content" }}
            style={{ fontSize: 12 }}
          />
        </SectionCard>

        {/* ── TRANSACTION DETAIL ── */}
        <SectionCard title="Transaction Detail">
          <Table
            columns={paymentColumns}
            dataSource={paymentHistory.map((p) => ({ ...p, key: p.id }))}
            rowKey="key"
            size="small"
            bordered
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Total ${t} records` }}
            scroll={{ x: "max-content" }}
            style={{ fontSize: 12 }}
          />
        </SectionCard>

      </div>

      {/* ── FOLLOW-UP MODAL ── */}
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

      <style>{`
        /* ── Descriptions: uniform single-line rows ── */
        .ant-descriptions-item-label {
          font-size: 12px !important;
          font-weight: 500 !important;
          white-space: nowrap !important;
          vertical-align: middle !important;
          padding: 6px 10px !important;
        }
        .ant-descriptions-item-content {
          font-size: 12px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: 0 !important;
          vertical-align: middle !important;
          padding: 6px 10px !important;
        }
        /* ── Table header/body ── */
        .ant-table-thead > tr > th {
          background: #f5f7fa !important;
          font-size: 12px !important;
          color: #666 !important;
          white-space: nowrap !important;
          padding: 6px 8px !important;
        }
        .ant-table-tbody > tr > td {
          font-size: 12px !important;
          padding: 5px 8px !important;
        }
      `}</style>
    </div>
  );
}

/* ── Reusable section card ── */
function SectionCard({ title, statusLabel, actions, children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8ecf0",
        borderRadius: 8,
        marginBottom: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 16, background: "#003eb3", borderRadius: 2 }} />
          <span style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>{title}</span>
          {statusLabel && (
            <span style={{ fontSize: 12, fontWeight: 600, color: statusLabel === "active" ? "#52c41a" : "#ff4d4f" }}>
              {statusLabel}
            </span>
          )}
        </div>
        {actions && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{actions}</div>}
      </div>
      <div style={{ padding: "14px 16px" }}>{children}</div>
      <style>{`
        .ant-picker-input {
          height: 28px !important;
          margin-left: 5px;
          margin-right: 5px;
        }
      `}</style>
    </div>
  );
}