import React from "react";

const STATUS_COLORS = {
  Active: { bg: "#EAF3DE", color: "#3B6D11" },
  Inactive: { bg: "#FCEBEB", color: "#A32D2D" },
  Away: { bg: "#FAEEDA", color: "#854F0B" },
  Admin: { bg: "#EEEDFE", color: "#534AB7" },
  Manager: { bg: "#E6F1FB", color: "#185FA5" },
  User: { bg: "#F1EFE8", color: "#5F5E5A" },
  Read: { bg: "#E6F1FB", color: "#185FA5" },
  Write: { bg: "#FAEEDA", color: "#854F0B" },
  Full: { bg: "#EEEDFE", color: "#534AB7" },
  Monthly: { bg: "#E6F1FB", color: "#185FA5" },
  Annual: { bg: "#EEEDFE", color: "#534AB7" },
  Lifetime: { bg: "#EAF3DE", color: "#3B6D11" },
};

export function Badge({ label, size = "md" }) {
  const colors = STATUS_COLORS[label] || { bg: "#F1EFE8", color: "#5F5E5A" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: size === "sm" ? "2px 7px" : "3px 9px",
        borderRadius: 20,
        fontSize: size === "sm" ? 11 : 11.5,
        fontWeight: 500,
        background: colors.bg,
        color: colors.color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function BoolTag({ value }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "2px 7px",
        borderRadius: 5,
        fontSize: 11,
        fontWeight: 500,
        background: value ? "#EAF3DE" : "#FCEBEB",
        color: value ? "#3B6D11" : "#A32D2D",
      }}
    >
      {value ? "✓ Yes" : "✗ No"}
    </span>
  );
}

export function MonoTag({ children }) {
  return (
    <span
      style={{
        fontFamily: `"Inter", sans-serif`,
        fontSize: 12,
        background: "#f5f5f3",
        padding: "3px 7px",
        borderRadius: 5,
        color: "inherit",
      }}
    >
      {children}
    </span>
  );
}
