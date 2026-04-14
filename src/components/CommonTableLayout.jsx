import React, { useEffect, useState, useMemo } from "react";
import { Table, Button, Input, Modal, Space, Flex } from "antd";
import { SearchOutlined, FileExcelOutlined } from "@ant-design/icons";
import { App } from "antd";

/**
 * CommonTableLayout
 *
 * A reusable layout shell for data-table pages.
 *
 * Props:
 * ─────────────────────────────────────────────────────────
 * columns        (array)     – Ant Design column definitions
 * dataSource     (array)     – Full dataset (unfiltered)
 * rowKey         (string)    – Unique key field  (default: "id")
 * loading        (bool)      – Show table skeleton
 * pageSize       (number)    – Rows per page      (default: 20)
 * searchFields   (string[])  – Fields to search across
 *                              (default: ["first_name","last_name","email","phone_number"])
 * searchPlaceholder (string) – Input placeholder
 *
 * exportFilename (string)    – CSV filename prefix  (default: "export")
 * exportHeaders  (string[])  – CSV column headers
 * exportMapper   (fn)        – (row) => array of values for CSV row
 *                              If omitted, uses Object.values(row)
 *
 * toolbarExtra   (ReactNode) – Extra buttons/controls placed left of search
 * modalTitle     (string)    – Modal header text
 * modalWidth     (number)    – Modal width         (default: 650)
 * modalOpen      (bool)      – Controlled open state
 * onModalClose   (fn)        – Called when modal is closed
 * modalContent   (ReactNode) – Form / content rendered inside modal
 *
 * onPageChange   (fn)        – (page) => void  (optional)
 * scroll         (object)    – Table scroll override (default: { x: "max-content", y: "calc(100vh - 180px)" })
 *
 * Usage Example (UsersPage):
 * ─────────────────────────────────────────────────────────
 * <CommonTableLayout
 *   columns={columns}
 *   dataSource={users}
 *   searchFields={["first_name", "last_name", "email", "phone_number"]}
 *   exportFilename="users"
 *   exportHeaders={["ID","First Name","Last Name","Email","Phone","Status"]}
 *   exportMapper={(u) => [u.id, u.first_name, u.last_name, u.email, u.phone_number, u.status]}
 *   toolbarExtra={<Button icon={<UserAddOutlined />} onClick={openAdd}>Add User</Button>}
 *   modalTitle={editingUser ? "Edit User" : "Add User"}
 *   modalOpen={isModalVisible}
 *   onModalClose={() => setIsModalVisible(false)}
 *   modalContent={<YourForm />}
 * />
 */
export default function CommonTableLayout({
  // Table
  columns = [],
  dataSource = [],
  rowKey = "id",
  loading = false,
  pageSize = 20,
  scroll,
  onPageChange,
  pagination,
  onTableChange,

  // Search
  searchFields = ["first_name", "last_name", "email", "phone_number"],
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  disableClientSearch = false,

  // Export
  exportFilename = "export",
  exportHeaders,
  exportMapper,

  // Toolbar
  toolbarExtra,

  // Modal
  modalTitle = "Details",
  modalWidth = 650,
  modalOpen = false,
  onModalClose,
  modalContent,
}) {
  const { message } = App.useApp();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const isControlledSearch = typeof searchValue === "string";
  const activeSearchInput = isControlledSearch ? searchValue : searchInput;

  // Debounced search
  useEffect(() => {
    if (isControlledSearch) return undefined;
    const timer = setTimeout(() => {
      setPage(1);
      setSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [isControlledSearch, searchInput]);

  // Reset page when data changes
  useEffect(() => {
    if (pagination?.current) {
      setPage(pagination.current);
      return;
    }
    setPage(1);
  }, [dataSource, pagination?.current]);

  // Multi-field filtering
  const filteredData = useMemo(() => {
    if (disableClientSearch) return dataSource;
    if (!searchQuery) return dataSource;
    const q = searchQuery.toLowerCase();
    return dataSource.filter((row) =>
      searchFields.some((field) =>
        String(row[field] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [dataSource, disableClientSearch, searchQuery, searchFields]);

  // Numbered "Sr." column prepended automatically
  const numberedColumns = useMemo(
    () => [
      {
        title: "Sr.",
        key: "__sr__",
        width: 50,
        align: "center",
        fixed: "left",
        render: (_, __, i) => (page - 1) * pageSize + i + 1,
      },
      ...columns,
    ],
    [columns, page, pageSize],
  );

  // CSV Export
  const handleExport = () => {
    if (filteredData.length === 0) return message.warning("No data to export");

    const headers = exportHeaders ?? Object.keys(filteredData[0] ?? {});
    const rows = filteredData.map((row) =>
      exportMapper ? exportMapper(row).join(",") : Object.values(row).join(","),
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFilename}_${new Date().toLocaleDateString()}.csv`;
    a.style.visibility = "hidden";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    message.success("CSV exported successfully");
  };

  const handlePageChange = (p, nextPageSize) => {
    setPage(p);
    onPageChange?.(p, nextPageSize);
  };

  return (
    <div
      style={{
        background: "#fff",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── TOOLBAR ─────────────────────────────────────── */}
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
        {/* Left slot — optional extra controls */}
        <Space>{toolbarExtra ?? <span />}</Space>

        {/* Right slot — export + search (always present) */}
        <Space>
          <Button
            icon={<FileExcelOutlined />}
            size="middle"
            onClick={handleExport}
          >
            Export CSV
          </Button>
          <Input
            placeholder={searchPlaceholder}
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            size="middle"
            allowClear
            style={{ maxWidth: 250 }}
            value={activeSearchInput}
            onChange={(e) => {
              const nextValue = e.target.value;
              if (isControlledSearch) {
                onSearchChange?.(nextValue);
                return;
              }
              setSearchInput(nextValue);
            }}
          />
        </Space>
      </Flex>

      {/* ── TABLE ───────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Table
          columns={numberedColumns}
          dataSource={filteredData}
          rowKey={rowKey}
          loading={loading}
          size="small"
          bordered
          pagination={
            pagination ?? {
              current: page,
              pageSize,
              total: filteredData.length,
              size: "small",
              position: ["bottomRight"],
              onChange: handlePageChange,
              showSizeChanger: false,
            }
          }
          onChange={onTableChange}
          scroll={
            scroll ?? {
              x: "max-content",
              y: "calc(100vh - 180px)",
            }
          }
        />
      </div>

      {/* ── MODAL ───────────────────────────────────────── */}
      {modalContent && (
        <Modal
          title={modalTitle}
          open={modalOpen}
          onCancel={onModalClose}
          footer={null}
          width={modalWidth}
          destroyOnClose
        >
          {modalContent}
        </Modal>
      )}

      {/* ── GLOBAL TABLE STYLES ─────────────────────────── */}
      <style>{`
        .ant-table-thead > tr > th {
          background-color: #f5f7fa !important;
          font-size: 12px !important;
          color: #888 !important;
          height: 38px !important;
        }
        .ant-table-row-alternate { background-color: #fafafa; }
        .ant-form-item { margin-bottom: 12px !important; }
        .ant-form-item-label { padding-bottom: 4px !important; }
        .ant-form-item-label label { font-size: 12px; font-weight: 500; color: #666; }
        .ant-pagination { padding: 5px; height: 40px; margin: 0; }
        .ant-table-wrapper .ant-table-pagination.ant-pagination { margin: 0; }
      `}</style>
    </div>
  );
}
