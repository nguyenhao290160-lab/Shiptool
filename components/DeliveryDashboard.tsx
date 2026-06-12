"use client";

import React from "react";
import { DeliveryOrder } from "@/lib/types";

interface Props {
  orders: DeliveryOrder[];
}

interface StatItem {
  label: string;
  value: number;
  dot: string;
  bg: string;
}

export const DeliveryDashboard = ({ orders }: Props) => {
  const total = orders.length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const delivering = orders.filter((o) => o.status === "delivering").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const failedOrCancelled = orders.filter(
    (o) => o.status === "failed" || o.status === "cancelled"
  ).length;

  const stats: StatItem[] = [
    { label: "Tổng đơn", value: total, dot: "bg-cyan-400", bg: "bg-cyan-50 border-cyan-200" },
    { label: "Chờ giao", value: pending, dot: "bg-amber-400", bg: "bg-amber-50 border-amber-200" },
    { label: "Đang giao", value: delivering, dot: "bg-sky-400", bg: "bg-sky-50 border-sky-200" },
    { label: "Đã giao", value: delivered, dot: "bg-emerald-400", bg: "bg-emerald-50 border-emerald-200" },
    { label: "Thất bại/Hủy", value: failedOrCancelled, dot: "bg-red-400", bg: "bg-red-50 border-red-200" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-xl border p-2.5 flex flex-col items-center justify-center text-center ${s.bg}`}
        >
          <span className={`w-2 h-2 rounded-full ${s.dot} mb-1`} />
          <span className="text-2xl font-black text-slate-900 leading-none">
            {s.value}
          </span>
          <span className="text-[10px] font-semibold text-slate-600 mt-1 leading-tight">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
};
