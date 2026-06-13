"use client";

import React from "react";
import { CustomerStatsSummary } from "@/lib/customerUtils";

interface CustomerStatsProps {
  stats: CustomerStatsSummary;
}

export const CustomerStats: React.FC<CustomerStatsProps> = ({ stats }) => {
  const statCards = [
    {
      label: "Tổng khách",
      value: stats.totalCustomers,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      icon: "👥",
    },
    {
      label: "Có tọa độ",
      value: stats.withCoordinates,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      icon: "📍",
    },
    {
      label: "Chưa tọa độ",
      value: stats.withoutCoordinates,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      icon: "❓",
    },
    {
      label: "Tổng đơn ghi nhận",
      value: stats.totalOrders,
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
      icon: "📦",
    },
    {
      label: "Đơn đã giao",
      value: stats.totalDelivered,
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      icon: "✓",
    },
    {
      label: "Đơn thất bại",
      value: stats.totalFailed,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      icon: "✗",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {statCards.map((card) => (
        <div
          key={card.label}
          className={`${card.bgColor} border ${card.borderColor} rounded-xl p-3 flex flex-col items-center justify-center text-center`}
        >
          <span className="text-2xl mb-1">{card.icon}</span>
          <span className="text-xl font-bold text-slate-900">{card.value}</span>
          <span className="text-[10px] font-semibold text-slate-600 mt-1 leading-tight">{card.label}</span>
        </div>
      ))}
    </div>
  );
};
