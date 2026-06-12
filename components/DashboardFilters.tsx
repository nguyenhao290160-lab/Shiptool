"use client";

import React from "react";
import { FilterOptions } from "@/lib/dashboardStats";
import { DeliveryStatus, DeliveryPriority } from "@/lib/types";

interface DashboardFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function DashboardFilters({
  filters,
  onFiltersChange,
}: DashboardFiltersProps) {
  const handleDateRangeChange = (
    range: "all" | "today" | "7days" | "30days"
  ) => {
    onFiltersChange({ ...filters, dateRange: range });
  };

  const handleStatusChange = (status: DeliveryStatus | "all") => {
    onFiltersChange({ ...filters, status });
  };

  const handlePriorityChange = (priority: DeliveryPriority | "all") => {
    onFiltersChange({ ...filters, priority });
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
      <h3 className="font-bold text-slate-900">Bộ lọc</h3>

      {/* Date Range */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-2">Khoảng thời gian</p>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {(["all", "today", "7days", "30days"] as const).map((range) => (
            <button
              key={range}
              onClick={() => handleDateRangeChange(range)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.dateRange === range
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {range === "all"
                ? "Tất cả"
                : range === "today"
                  ? "Hôm nay"
                  : range === "7days"
                    ? "7 ngày"
                    : "30 ngày"}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-2">Trạng thái</p>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          {(
            [
              "all",
              "pending",
              "delivering",
              "delivered",
              "failed",
              "cancelled",
            ] as const
          ).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.status === status
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {status === "all"
                ? "Tất cả"
                : status === "pending"
                  ? "Chờ giao"
                  : status === "delivering"
                    ? "Đang giao"
                    : status === "delivered"
                      ? "Đã giao"
                      : status === "failed"
                        ? "Thất bại"
                        : "Đã hủy"}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-2">Mức ưu tiên</p>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {(["all", "high", "normal", "low"] as const).map((priority) => (
            <button
              key={priority}
              onClick={() => handlePriorityChange(priority)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.priority === priority
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {priority === "all"
                ? "Tất cả"
                : priority === "high"
                  ? "Cao"
                  : priority === "normal"
                    ? "Bình thường"
                    : "Thấp"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
