"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getDeliveryOrders } from "@/lib/deliveryStorage";
import {
  calculateDashboardStats,
  applyFilters,
  getRecentOrders,
  getPendingOrders,
  FilterOptions,
  DashboardStats,
} from "@/lib/dashboardStats";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { StatCard } from "./StatCard";
import { AlertBox } from "./AlertBox";
import { RecentOrdersList } from "./RecentOrdersList";
import { DashboardFilters } from "./DashboardFilters";
import { PerformanceChart } from "./PerformanceChart";

export function PerformanceDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [orders, setOrders] = useState<ReturnType<typeof getDeliveryOrders>>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<ReturnType<typeof getRecentOrders>>([]);
  const [pendingOrders, setPendingOrders] = useState<ReturnType<typeof getPendingOrders>>([]);
  const isOnline = useOnlineStatus();

  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: "all",
    status: "all",
    priority: "all",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const allOrders = getDeliveryOrders();
      setOrders(allOrders);

      const filteredOrders = applyFilters(allOrders, filters);
      setStats(calculateDashboardStats(filteredOrders));
      setRecentOrders(getRecentOrders(allOrders, 5));
      setPendingOrders(getPendingOrders(allOrders, 5));
    }, 0);

    return () => clearTimeout(timer);
  }, [filters]);

  const hasUngeocoded = orders.some((o) => !o.lat || !o.lng);
  const highPriorityPending = useMemo(
    () => orders.filter(
      (o) => o.priority === "high" && (o.status === "pending" || o.status === "delivering")
    ),
    [orders]
  );

  const [needsBackup, setNeedsBackup] = useState(false);

  useEffect(() => {
    try {
      const lastBackupTime = localStorage.getItem("shiproute_last_backup_time");
      if (!lastBackupTime) {
        setNeedsBackup(true);
      } else {
        const backupTime = parseInt(lastBackupTime, 10);
        setNeedsBackup(Date.now() - backupTime > 24 * 60 * 60 * 1000);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!isMounted || !stats) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="animate-pulse flex gap-4">
          <div className="flex-1 h-20 bg-slate-200 rounded" />
          <div className="flex-1 h-20 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Báo cáo hiệu suất</h1>
        <p className="text-sm text-slate-500">
          {orders.length} đơn · Dữ liệu cập nhật {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* ── Alerts ── */}
      <div className="space-y-3">
        {!isOnline && (
          <AlertBox
            type="offline"
            title="Bạn đang offline"
            message="Google API có thể không hoạt động. Dữ liệu local vẫn sẵn dùng."
          />
        )}

        {hasUngeocoded && stats.ordersMissingCoordinates > 0 && (
          <AlertBox
            type="warning"
            title={`${stats.ordersMissingCoordinates} đơn chưa có tọa độ`}
            message="Dùng chức năng Lấy tọa độ để hiển thị marker trên bản đồ."
          />
        )}

        {highPriorityPending.length > 0 && (
          <AlertBox
            type="info"
            title={`${highPriorityPending.length} đơn ưu tiên cao chưa giao`}
            message="Ưu tiên xử lý những đơn này trước."
          />
        )}

        {needsBackup && (
          <AlertBox
            type="info"
            title="Chưa có backup gần đây"
            message="Hãy xuất backup JSON để tránh mất dữ liệu."
          />
        )}
      </div>

      {/* ── Filters ── */}
      <DashboardFilters filters={filters} onFiltersChange={setFilters} />

      {/* ── Main Stats Cards ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon="📦"
          label="Tổng đơn"
          value={stats.totalOrders.toString()}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <StatCard
          icon="⏳"
          label="Chờ giao"
          value={stats.pendingOrders.toString()}
          bgColor="bg-amber-50"
          textColor="text-amber-600"
        />
        <StatCard
          icon="🚚"
          label="Đang giao"
          value={stats.deliveringOrders.toString()}
          bgColor="bg-cyan-50"
          textColor="text-cyan-600"
        />
        <StatCard
          icon="✅"
          label="Đã giao"
          value={stats.deliveredOrders.toString()}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
      </div>

      {/* ── Performance Chart ── */}
      <PerformanceChart stats={stats} />

      {/* ── Secondary Stats ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          icon="❌"
          label="Thất bại"
          value={stats.failedOrders.toString()}
          bgColor="bg-red-50"
          textColor="text-red-600"
          size="sm"
        />
        <StatCard
          icon="🚫"
          label="Đã hủy"
          value={stats.cancelledOrders.toString()}
          bgColor="bg-slate-50"
          textColor="text-slate-600"
          size="sm"
        />
        <StatCard
          icon="⭐"
          label="Ưu tiên cao"
          value={stats.highPriorityOrders.toString()}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
          size="sm"
        />
        <StatCard
          icon="📍"
          label="Có tọa độ"
          value={`${stats.ordersWithCoordinates}/${stats.totalOrders}`}
          bgColor="bg-indigo-50"
          textColor="text-indigo-600"
          size="sm"
        />
        <StatCard
          icon="🗺️"
          label="Chưa có tọa độ"
          value={stats.ordersMissingCoordinates.toString()}
          bgColor="bg-orange-50"
          textColor="text-orange-600"
          size="sm"
        />
        <StatCard
          icon="🎯"
          label="Đang hoạt động"
          value={stats.activeOrders.toString()}
          bgColor="bg-pink-50"
          textColor="text-pink-600"
          size="sm"
        />
      </div>

      {/* ── Recent Orders ── */}
      <RecentOrdersList orders={recentOrders} title="5 đơn mới nhất" />

      {/* ── Pending Orders ── */}
      {pendingOrders.length > 0 && (
        <RecentOrdersList orders={pendingOrders} title="Đơn cần xử lý tiếp" />
      )}

      {/* ── Empty State ── */}
      {orders.length === 0 && (
        <div className="bg-slate-50 rounded-3xl p-8 text-center border-2 border-dashed border-slate-300">
          <p className="text-slate-600 font-semibold mb-2">Chưa có đơn giao nào.</p>
          <p className="text-sm text-slate-500">Bắt đầu bằng cách thêm đơn giao hoặc tạo tuyến mới.</p>
        </div>
      )}
    </div>
  );
}
