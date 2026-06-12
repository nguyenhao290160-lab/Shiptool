"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DeliveryOrder, DeliveryStatus } from "@/lib/types";
import {
  seedDemoOrdersIfEmpty,
  getDeliveryOrders,
  saveDeliveryOrder,
  deleteDeliveryOrder,
} from "@/lib/deliveryStorage";
import { geocodeAddress } from "@/lib/geocoding";
import { getGoogleMapsApiKey, isOnline } from "@/lib/mapUtils";
import { DeliveryDashboard } from "@/components/DeliveryDashboard";
import { DeliveryOrderCard } from "@/components/DeliveryOrderCard";
import { DeliveryOrderForm } from "@/components/DeliveryOrderForm";

// ── Status filter tabs ──────────────────────────────────────────────

type FilterKey = "all" | DeliveryStatus;

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ giao" },
  { key: "delivering", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
  { key: "failed", label: "Thất bại" },
  { key: "cancelled", label: "Đã hủy" },
];

// ── Page component ──────────────────────────────────────────────────

export default function OrdersPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<DeliveryOrder | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [geocodingLoading, setGeocodingLoading] = useState<Set<string>>(new Set());
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [batchResult, setBatchResult] = useState<{ success: number; error: number } | null>(null);

  // ── Initialise (hydration-safe) ───────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      const loaded = seedDemoOrdersIfEmpty();
      setOrders(loaded);
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // ── Refresh from localStorage ─────────────────────────────────────

  const refresh = useCallback(() => {
    setOrders(getDeliveryOrders());
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────

  const handleSave = (order: DeliveryOrder) => {
    saveDeliveryOrder(order);
    refresh();
    setShowForm(false);
    setEditingOrder(undefined);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa đơn này?")) return;
    deleteDeliveryOrder(id);
    refresh();
  };

  const handleStatusChange = (id: string, status: DeliveryStatus) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    saveDeliveryOrder({ ...order, status, updatedAt: new Date().toISOString() });
    refresh();
  };

  const handleEdit = (order: DeliveryOrder) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingOrder(undefined);
    setShowForm(true);
  };

  // ── Geocoding handlers ──────────────────────────────────────────────

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes("Zero results") || msg.includes("ZERO_RESULTS")) {
        return "Không tìm thấy tọa độ cho địa chỉ này";
      }
      if (msg.includes("API key") || msg.includes("INVALID_REQUEST")) {
        return "Chưa cấu hình Google Maps API key";
      }
      if (msg.includes("OVER_QUERY_LIMIT")) {
        return "Google Geocoding API đang bị giới hạn, vui lòng thử lại";
      }
      return msg;
    }
    return "Lỗi không xác định khi lấy tọa độ";
  };

  const handleGeocodeOrder = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    if (!order.address?.trim()) {
      alert("Đơn này chưa có địa chỉ");
      return;
    }

    if (!isOnline()) {
      alert("Bạn đang offline, không thể lấy tọa độ");
      return;
    }

    const apiKey = getGoogleMapsApiKey();
    if (!apiKey) {
      alert("Chưa cấu hình Google Maps API key");
      return;
    }

    setGeocodingLoading((prev) => new Set(prev).add(orderId));

    try {
      const result = await geocodeAddress(order.address, apiKey);
      const updatedOrder: DeliveryOrder = {
        ...order,
        lat: result.lat,
        lng: result.lng,
        geocodedAddress: result.formattedAddress,
        placeId: result.placeId,
        geocodingStatus: "success",
        geocodingError: undefined,
        updatedAt: new Date().toISOString(),
      };
      saveDeliveryOrder(updatedOrder);
      refresh();
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      const updatedOrder: DeliveryOrder = {
        ...order,
        geocodingStatus: "error",
        geocodingError: errorMsg,
        updatedAt: new Date().toISOString(),
      };
      saveDeliveryOrder(updatedOrder);
      refresh();
    } finally {
      setGeocodingLoading((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  const handleGeocodeMissingOrders = async () => {
    const apiKey = getGoogleMapsApiKey();
    if (!apiKey) {
      alert("Chưa cấu hình Google Maps API key");
      return;
    }

    if (!isOnline()) {
      alert("Bạn đang offline, không thể lấy tọa độ hàng loạt");
      return;
    }

    const missingOrders = orders.filter(
      (o) => o.address?.trim() && !o.lat && !o.lng
    );

    if (missingOrders.length === 0) {
      alert("Tất cả đơn đều đã có tọa độ rồi");
      return;
    }

    if (!confirm(`Lấy tọa độ cho ${missingOrders.length} đơn? Quá trình này có thể mất vài phút.`)) {
      return;
    }

    setBatchProgress({ current: 0, total: missingOrders.length });
    setBatchResult(null);
    let successCount = 0;
    let errorCount = 0;

    // Add all orders to loading state
    setGeocodingLoading(new Set(missingOrders.map((o) => o.id)));

    for (let i = 0; i < missingOrders.length; i++) {
      const order = missingOrders[i];
      setBatchProgress({ current: i + 1, total: missingOrders.length });

      try {
        const result = await geocodeAddress(order.address, apiKey);
        const updatedOrder: DeliveryOrder = {
          ...order,
          lat: result.lat,
          lng: result.lng,
          geocodedAddress: result.formattedAddress,
          placeId: result.placeId,
          geocodingStatus: "success",
          geocodingError: undefined,
          updatedAt: new Date().toISOString(),
        };
        saveDeliveryOrder(updatedOrder);
        successCount++;
      } catch (error) {
        const errorMsg = getErrorMessage(error);
        const updatedOrder: DeliveryOrder = {
          ...order,
          geocodingStatus: "error",
          geocodingError: errorMsg,
          updatedAt: new Date().toISOString(),
        };
        saveDeliveryOrder(updatedOrder);
        errorCount++;
      }

      // Small delay to avoid API rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    refresh();
    setGeocodingLoading(new Set());
    setBatchProgress(null);
    setBatchResult({ success: successCount, error: errorCount });
  };

  // ── Filtered + searched list ──────────────────────────────────────

  const filteredOrders = orders
    .filter((o) => (filter === "all" ? true : o.status === filter))
    .filter((o) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.customerName.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q) ||
        o.phone.includes(q)
      );
    })
    // Sort: high priority first, then by createdAt desc
    .sort((a, b) => {
      const prioOrder = { high: 0, normal: 1, low: 2 };
      const prioDiff = prioOrder[a.priority] - prioOrder[b.priority];
      if (prioDiff !== 0) return prioDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // ── SSR placeholder ───────────────────────────────────────────────

  if (!isMounted) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col max-w-3xl mx-auto">
        <div className="p-6" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col max-w-3xl mx-auto shadow-xl">
      {/* ── Header ── */}
      <header className="bg-white sticky top-0 z-30 border-b border-slate-200 shadow-sm">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/home")}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Quản lý đơn giao
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {orders.length} đơn · Dữ liệu lưu trên thiết bị
              </p>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-sm shadow-cyan-600/20 flex items-center gap-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Thêm đơn
          </button>
        </div>

        {/* ── Search bar ── */}
        <div className="px-5 pb-3">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Tìm theo tên, địa chỉ, SĐT..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 outline-none transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div className="px-5 pb-3 flex gap-1.5 overflow-x-auto no-scrollbar">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filter === tab.key
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 p-5 flex flex-col gap-5 pb-24">
        {/* ── Dashboard stats ── */}
        <DeliveryDashboard orders={orders} />

        {/* ── Offline notice ── */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-cyan-600 mt-0.5 shrink-0"
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
          <p className="text-xs text-cyan-800 font-medium leading-relaxed">
            Dữ liệu đơn giao đang được lưu cục bộ trên thiết bị này. Khi mất
            mạng, bạn vẫn có thể xem và chỉnh sửa danh sách đơn.
          </p>
        </div>

        {/* ── Order list ── */}
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-slate-500 font-semibold">
              {searchQuery
                ? "Không tìm thấy đơn nào phù hợp."
                : "Chưa có đơn giao nào."}
            </p>
            {!searchQuery && (
              <button
                onClick={handleAddNew}
                className="mt-4 text-cyan-600 font-bold text-sm hover:underline"
              >
                + Thêm đơn giao đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Batch geocoding section */}
            {orders.some((o) => o.address?.trim() && !o.lat && !o.lng) && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <div className="text-sm text-blue-800 font-medium">
                    {batchProgress ? (
                      <>Đang xử lý {batchProgress.current}/{batchProgress.total} đơn</>
                    ) : batchResult ? (
                      <>Thành công: {batchResult.success}, Lỗi: {batchResult.error}</>
                    ) : (
                      <>Có {orders.filter((o) => o.address?.trim() && !o.lat && !o.lng).length} đơn chưa có tọa độ</>
                    )}
                  </div>
                </div>
                {!batchProgress && (
                  <button
                    onClick={handleGeocodeMissingOrders}
                    disabled={batchResult !== null}
                    className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {batchResult ? "Xong" : "Lấy tọa độ cho tất cả"}
                  </button>
                )}
                {batchResult && (
                  <button
                    onClick={() => setBatchResult(null)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-800 px-2 py-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {filteredOrders.map((order) => (
              <DeliveryOrderCard
                key={order.id}
                order={order}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onGeocode={handleGeocodeOrder}
                geocodingLoading={geocodingLoading}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Form modal ── */}
      {showForm && (
        <DeliveryOrderForm
          key={editingOrder?.id ?? "new-order"}
          initial={editingOrder}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingOrder(undefined);
          }}
        />
      )}
    </div>
  );
}
