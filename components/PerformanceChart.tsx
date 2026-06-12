"use client";

import React from "react";
import { DashboardStats } from "@/lib/dashboardStats";

interface PerformanceChartProps {
  stats: DashboardStats;
}

export function PerformanceChart({ stats }: PerformanceChartProps) {
  const { successRate, pendingRate, failureRate, totalOrders } = stats;
  const completedOrders =
    stats.deliveredOrders + stats.failedOrders + stats.cancelledOrders;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-6">
      <h3 className="font-bold text-lg text-slate-900">Hiệu suất giao hàng</h3>

      {/* Success Rate Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">Tỷ lệ giao thành công</p>
          <p className="text-sm font-bold text-green-600">
            {completedOrders > 0 ? successRate : 0}%
          </p>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-green-500 h-2 transition-all duration-300"
            style={{ width: `${completedOrders > 0 ? successRate : 0}%` }}
          />
        </div>
        {completedOrders === 0 && (
          <p className="text-xs text-slate-500 mt-1">Chưa có dữ liệu hoàn thành</p>
        )}
      </div>

      {/* Pending Rate Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">
            Tỷ lệ chờ xử lý
          </p>
          <p className="text-sm font-bold text-amber-600">
            {totalOrders > 0 ? pendingRate : 0}%
          </p>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-amber-500 h-2 transition-all duration-300"
            style={{ width: `${totalOrders > 0 ? pendingRate : 0}%` }}
          />
        </div>
      </div>

      {/* Failure Rate Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">Tỷ lệ thất bại/hủy</p>
          <p className="text-sm font-bold text-red-600">
            {completedOrders > 0 ? failureRate : 0}%
          </p>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-red-500 h-2 transition-all duration-300"
            style={{ width: `${completedOrders > 0 ? failureRate : 0}%` }}
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
        <div className="text-center">
          <p className="text-xs text-slate-600 mb-1">Hoàn thành</p>
          <p className="text-lg font-bold text-slate-900">{completedOrders}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-600 mb-1">Thành công</p>
          <p className="text-lg font-bold text-green-600">
            {stats.deliveredOrders}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-600 mb-1">Thất bại</p>
          <p className="text-lg font-bold text-red-600">
            {stats.failedOrders + stats.cancelledOrders}
          </p>
        </div>
      </div>
    </div>
  );
}
