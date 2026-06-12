"use client";

import React from "react";
import { RoutePoint, DeliveryStatus, DeliveryPriority } from "@/lib/types";

// ── Config maps ─────────────────────────────────────────────────────

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  pending: "Chờ giao",
  delivering: "Đang giao",
  delivered: "Đã giao",
  failed: "Thất bại",
  cancelled: "Đã hủy",
};

const STATUS_DOT: Record<DeliveryStatus, string> = {
  pending: "bg-amber-400",
  delivering: "bg-cyan-400",
  delivered: "bg-emerald-400",
  failed: "bg-red-400",
  cancelled: "bg-slate-400",
};

const PRIORITY_BADGE: Record<DeliveryPriority, { label: string; cls: string }> = {
  high: { label: "Cao", cls: "text-red-600 bg-red-50 border-red-200" },
  normal: { label: "BT", cls: "text-slate-600 bg-slate-50 border-slate-200" },
  low: { label: "Thấp", cls: "text-slate-400 bg-slate-50 border-slate-200" },
};

// ── Props ───────────────────────────────────────────────────────────

interface Props {
  point: RoutePoint;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToTop: () => void;
  onMoveToBottom: () => void;
}

// ── Component ───────────────────────────────────────────────────────

export const RoutePointCard = ({
  point,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
}: Props) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const pr = PRIORITY_BADGE[point.priority];
  const hasCoords = point.lat != null && point.lng != null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex">
        {/* ── Sequence number column ── */}
        <div className="w-14 shrink-0 bg-cyan-600 flex flex-col items-center justify-center text-white">
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
            #
          </span>
          <span className="text-2xl font-black leading-none">
            {index + 1}
          </span>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 px-4 py-3">
          {/* Row 1: name + badges */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
              {point.customerName}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${pr.cls}`}
              >
                {pr.label}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[point.status]}`} />
                {STATUS_LABEL[point.status]}
              </span>
            </div>
          </div>

          {/* Row 2: address */}
          <p className="text-sm text-slate-700 leading-snug mb-1 flex items-start gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-cyan-500 mt-0.5 shrink-0"
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
            <span className="font-medium">{point.address}</span>
          </p>

          {/* Row 3: phone + note */}
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            {point.phone && (
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {point.phone}
              </span>
            )}
            {hasCoords && (
              <span className="text-emerald-600 flex items-center gap-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                GPS
              </span>
            )}
            {!hasCoords && (
              <span className="text-amber-500 flex items-center gap-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Chưa có GPS
              </span>
            )}
          </div>

          {/* Note */}
          {point.note && (
            <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 leading-snug">
              {point.note}
            </p>
          )}
        </div>

        {/* ── Reorder buttons column ── */}
        <div className="w-10 shrink-0 border-l border-slate-100 flex flex-col">
          <button
            onClick={onMoveToTop}
            disabled={isFirst}
            title="Đưa lên đầu"
            className={`flex-1 flex items-center justify-center transition-colors ${
              isFirst
                ? "text-slate-200 cursor-not-allowed"
                : "text-slate-500 hover:bg-slate-50 hover:text-cyan-600"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 11l7-7 7 7M5 19h14" />
            </svg>
          </button>
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            title="Lên"
            className={`flex-1 flex items-center justify-center transition-colors ${
              isFirst
                ? "text-slate-200 cursor-not-allowed"
                : "text-slate-500 hover:bg-slate-50 hover:text-cyan-600"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            title="Xuống"
            className={`flex-1 flex items-center justify-center transition-colors ${
              isLast
                ? "text-slate-200 cursor-not-allowed"
                : "text-slate-500 hover:bg-slate-50 hover:text-cyan-600"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onMoveToBottom}
            disabled={isLast}
            title="Đưa xuống cuối"
            className={`flex-1 flex items-center justify-center transition-colors ${
              isLast
                ? "text-slate-200 cursor-not-allowed"
                : "text-slate-500 hover:bg-slate-50 hover:text-cyan-600"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 13l-7 7-7-7M5 5h14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
