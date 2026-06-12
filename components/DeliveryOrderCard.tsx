"use client";

import React from "react";
import { DeliveryOrder, DeliveryStatus, DeliveryPriority } from "@/lib/types";

// ── Status config ───────────────────────────────────────────────────

const STATUS_CFG: Record<
  DeliveryStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: {
    label: "Chờ giao",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  delivering: {
    label: "Đang giao",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    dot: "bg-cyan-400",
  },
  delivered: {
    label: "Đã giao",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  failed: {
    label: "Thất bại",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-400",
  },
  cancelled: {
    label: "Đã hủy",
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
  },
};

const PRIORITY_CFG: Record<
  DeliveryPriority,
  { label: string; color: string }
> = {
  high: { label: "Ưu tiên cao", color: "text-red-600 bg-red-50 border-red-200" },
  normal: { label: "Bình thường", color: "text-slate-600 bg-slate-50 border-slate-200" },
  low: { label: "Thấp", color: "text-slate-400 bg-slate-50 border-slate-200" },
};

// ── Cycle order for quick status change ─────────────────────────────

const STATUS_CYCLE: DeliveryStatus[] = [
  "pending",
  "delivering",
  "delivered",
  "failed",
  "cancelled",
];

// ── Component ───────────────────────────────────────────────────────

interface Props {
  order: DeliveryOrder;
  onEdit: (order: DeliveryOrder) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: DeliveryStatus) => void;
}

export const DeliveryOrderCard = ({
  order,
  onEdit,
  onDelete,
  onStatusChange,
}: Props) => {
  const st = STATUS_CFG[order.status];
  const pr = PRIORITY_CFG[order.priority];

  const handleQuickStatus = () => {
    const curIdx = STATUS_CYCLE.indexOf(order.status);
    const next = STATUS_CYCLE[(curIdx + 1) % STATUS_CYCLE.length];
    onStatusChange(order.id, next);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-shadow hover:shadow-md">
      {/* ── Header row ── */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 leading-tight truncate">
            {order.customerName}
          </h3>
          {order.phone && (
            <p className="text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              {order.phone}
            </p>
          )}
        </div>

        {/* Priority badge */}
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${pr.color}`}
        >
          {pr.label}
        </span>
      </div>

      {/* ── Address ── */}
      <div className="mx-5 mb-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
        <p className="text-sm font-semibold text-slate-800 leading-snug flex items-start gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-cyan-500 mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {order.address}
        </p>
      </div>

      {/* ── Note ── */}
      {order.note && (
        <div className="mx-5 mb-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-sm font-medium text-amber-800 leading-snug flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-amber-500 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {order.note}
          </p>
        </div>
      )}

      {/* ── Footer: status + actions ── */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {/* Quick-toggle status */}
        <button
          onClick={handleQuickStatus}
          title="Nhấn để đổi trạng thái nhanh"
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${st.bg} ${st.text}`}
        >
          <span className={`w-2 h-2 rounded-full ${st.dot}`} />
          {st.label}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 opacity-60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(order)}
            className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sửa
          </button>
          <button
            onClick={() => onDelete(order.id)}
            className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};
