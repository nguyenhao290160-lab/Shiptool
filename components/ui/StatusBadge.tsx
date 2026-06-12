import React from "react";

interface Props {
  state: string;
  size?: "sm" | "md";
  className?: string;
}

const MAP: Record<string, string> = {
  // delivery statuses
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  delivering: "bg-cyan-50 text-cyan-700 border-cyan-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
  skipped: "bg-gray-100 text-gray-700 border-gray-200",

  // priorities
  high: "bg-red-100 text-red-700 border-red-200",
  normal: "bg-slate-100 text-slate-700 border-slate-200",
  low: "bg-slate-50 text-slate-600 border-slate-100",

  // api/system
  online: "bg-emerald-100 text-emerald-800 border-emerald-200",
  offline: "bg-amber-50 text-amber-800 border-amber-200",
  configured: "bg-cyan-50 text-cyan-700 border-cyan-200",
  unconfigured: "bg-red-50 text-red-700 border-red-200",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  error: "bg-red-50 text-red-700 border-red-200",
};

export const StatusBadge = ({ state, size = "md", className = "" }: Props) => {
  const cls = MAP[state] || "bg-slate-100 text-slate-700 border-slate-200";
  const sizeCls = size === "sm" ? "text-xs px-2 py-0.5 rounded-full" : "text-sm px-3 py-1 rounded-full";

  return (
    <span className={`inline-flex items-center font-semibold ${sizeCls} ${cls} ${className} border`}>
      {state === "pending" ? "Chờ giao" : state === "delivering" ? "Đang giao" : state === "delivered" ? "Đã giao" : state === "failed" ? "Thất bại" : state === "cancelled" ? "Hủy" : state === "skipped" ? "Bỏ qua" : state}
    </span>
  );
};

