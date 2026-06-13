import React from "react";

interface Props {
  state: string;
  size?: "sm" | "md";
  className?: string;
}

const MAP: Record<string, string> = {
  // delivery statuses
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  delivering: "bg-cyan-50 text-cyan-700 border-cyan-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  skipped: "bg-slate-100 text-slate-600 border-slate-200",

  // priorities
  high: "bg-rose-50 text-rose-700 border-rose-200",
  normal: "bg-slate-50 text-slate-600 border-slate-200",
  low: "bg-sky-50 text-sky-600 border-sky-200",

  // api/system
  online: "bg-emerald-50 text-emerald-700 border-emerald-200",
  offline: "bg-amber-50 text-amber-700 border-amber-200",
  configured: "bg-emerald-50 text-emerald-700 border-emerald-200",
  unconfigured: "bg-rose-50 text-rose-700 border-rose-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  error: "bg-rose-50 text-rose-700 border-rose-200",
};

const LABELS: Record<string, string> = {
  pending: "Chờ giao",
  delivering: "Đang giao",
  delivered: "Đã giao",
  failed: "Thất bại",
  cancelled: "Hủy",
  skipped: "Bỏ qua",
};

export const StatusBadge = ({ state, size = "md", className = "" }: Props) => {
  const cls = MAP[state] || "bg-slate-100 text-slate-600 border-slate-200";
  const sizeCls = size === "sm" ? "text-xs px-2.5 py-0.5" : "text-xs px-3 py-1";

  return (
    <span className={`inline-flex items-center font-bold rounded-full border ${sizeCls} ${cls} ${className}`}>
      {LABELS[state] || state}
    </span>
  );
};
