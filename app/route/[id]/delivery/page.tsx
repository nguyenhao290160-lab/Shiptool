"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { MobilePageShell } from "@/components/MobilePageShell";
import { getRouteById, saveRoute } from "@/lib/storage";
import { RoutePlan, OrderStop, DeliveryStatus } from "@/lib/types";
import { getDeliveryOrderById, saveDeliveryOrder } from "@/lib/deliveryStorage";
import { DeliveryOrder } from "@/lib/types";
import { buildGoogleMapsSearchUrl } from "@/lib/maps";
import { buildPhoneCallUrl, maskPhoneNumber } from "@/lib/phone";

export default function DeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [route, setRoute] = useState<RoutePlan | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const r = getRouteById(resolvedParams.id);
      if (r) {
        setRoute(r);
      } else {
        router.replace("/home");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [resolvedParams.id, router]);

  if (!isMounted) return <MobilePageShell><div className="p-5"></div></MobilePageShell>;
  if (!route) return <MobilePageShell><p>Loading...</p></MobilePageShell>;

  const currentIndex = route.currentStopIndex;
  const stop = route.stops[currentIndex];

  const updateStopStatus = async (status: DeliveryStatus) => {
    const updatedStops = [...route.stops];

    const now = new Date().toISOString();
    const updatedStop: OrderStop = { ...stop, status, updatedAt: now } as OrderStop;

    // If delivered, ask for optional recipient name / note
    if (status === "delivered") {
      const recipient = window.prompt("Tên người nhận (tùy chọn)", stop.recipientName || "") || undefined;
      const note = window.prompt("Ghi chú giao (tùy chọn)", stop.deliveryNote || "") || undefined;
      if (recipient) updatedStop.recipientName = recipient;
      if (note) updatedStop.deliveryNote = note;
      updatedStop.deliveredAt = now;
    }

    // If failed, ask for reason
    if (status === "failed") {
      const reason = window.prompt("Lý do giao thất bại (ví dụ: khách vắng, sai địa chỉ)", stop.failureReason || "") || undefined;
      if (reason) updatedStop.failureReason = reason;
      updatedStop.failedAt = now;
    }

    updatedStops[currentIndex] = updatedStop;

    // Auto advance if not the last
    let nextIndex = currentIndex;
    let newStatus: RoutePlan["status"] = route.status;

    if (currentIndex < route.stops.length - 1) {
      nextIndex = currentIndex + 1;
    } else {
      // Check if all are processed (not pending)
      const allDone = updatedStops.every((s) => s.status !== "pending" && s.status !== "ready");
      if (allDone) {
        newStatus = "completed";
      }
    }

    const updatedRoute: RoutePlan = {
      ...route,
      stops: updatedStops,
      currentStopIndex: nextIndex,
      status: newStatus,
    };

    // Persist route
    saveRoute(updatedRoute);
    setRoute(updatedRoute);

    // Also attempt to update central delivery orders if exists
    try {
      const masterOrder = getDeliveryOrderById(stop.id);
      if (masterOrder) {
        const merged: DeliveryOrder = { ...masterOrder, status, updatedAt: now } as DeliveryOrder;
        if (status === "delivered") {
          merged.deliveredAt = updatedStop.deliveredAt;
          if (updatedStop.recipientName) merged.recipientName = updatedStop.recipientName;
          if (updatedStop.deliveryNote) merged.deliveryNote = updatedStop.deliveryNote;
        }
        if (status === "failed") {
          merged.failedAt = updatedStop.failedAt;
          if (updatedStop.failureReason) merged.failureReason = updatedStop.failureReason;
        }
        saveDeliveryOrder(merged);
      }
    } catch {
      // non-critical
    }

    if (newStatus === "completed") {
      alert("Bạn đã hoàn thành tất cả các đơn trong tuyến này!");
      router.push("/home");
    }
  };

  const navigateStop = (dir: 1 | -1) => {
    const newIdx = currentIndex + dir;
    if (newIdx >= 0 && newIdx < route.stops.length) {
      const updatedRoute = { ...route, currentStopIndex: newIdx };
      saveRoute(updatedRoute);
      setRoute(updatedRoute);
    }
  };

  if (!stop) {
    return (
      <MobilePageShell title="Giao hàng" showBack>
        <div className="text-center py-10">Lỗi: Không tìm thấy đơn hàng.</div>
      </MobilePageShell>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    ready: "bg-indigo-50 text-indigo-700",
    assigned: "bg-violet-50 text-violet-700",
    delivering: "bg-cyan-50 text-cyan-700",
    delivered: "bg-emerald-50 text-emerald-700",
    failed: "bg-red-50 text-red-700",
    cancelled: "bg-slate-100 text-slate-600",
    skipped: "bg-slate-100 text-slate-600",
  };

  const statusLabels: Record<string, string> = {
    pending: "Chờ giao",
    ready: "Sẵn sàng",
    assigned: "Đã xếp",
    delivering: "Đang giao",
    delivered: "Đã giao",
    failed: "Giao thất bại",
    cancelled: "Đã hủy",
    skipped: "Bỏ qua",
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col max-w-md mx-auto shadow-xl">
      <header className="p-4 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm border-b border-slate-200">
        <button onClick={() => router.push(`/route/${route.id}/orders`)} className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="text-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đơn hiện tại</span>
          <h2 className="font-black text-2xl text-slate-900 leading-none">{currentIndex + 1} <span className="text-slate-400 font-medium text-lg">/ {route.stops.length}</span></h2>
        </div>
        <div className="w-10"></div> {/* spacer */}
      </header>

      <main className="flex-1 p-4 flex flex-col gap-6 pb-48">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-black text-slate-900 leading-tight pr-2">
              {stop.receiverName || stop.label}
            </h1>
            <span className={`text-sm px-3 py-1.5 rounded-full font-bold tracking-wide whitespace-nowrap ${statusColors[stop.status]}`}>
              {statusLabels[stop.status]}
            </span>
          </div>

          <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl mb-5">
            <p className="text-2xl font-bold text-slate-900 leading-snug">
              {stop.address}
            </p>
          </div>

          {stop.phone && (
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Số điện thoại</p>
                <p className="text-2xl font-black tracking-wide text-slate-900">{maskPhoneNumber(stop.phone)}</p>
              </div>
            </div>
          )}

          {stop.note && (
            <div className="mb-5 bg-red-50 border-2 border-red-100 p-4 rounded-2xl">
              <p className="text-red-500 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Ghi chú quan trọng
              </p>
              <p className="text-xl font-bold text-red-700 leading-tight">{stop.note}</p>
            </div>
          )}

          {stop.codAmount ? (
            <div className="mt-5 border-t-2 border-dashed border-slate-200 pt-5 text-center bg-emerald-50 rounded-2xl p-4">
              <p className="text-emerald-700 text-sm font-bold uppercase tracking-wider mb-1">Thu hộ (COD)</p>
              <p className="text-4xl font-black text-emerald-600">{stop.codAmount.toLocaleString("vi-VN")} đ</p>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white p-5 rounded-3xl font-bold flex flex-col items-center justify-center gap-3 transition-colors shadow-sm"
            onClick={() => window.open(buildGoogleMapsSearchUrl(stop.address), "_blank")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-lg">Mở Bản Đồ</span>
          </button>
          
          <button 
            className={`${stop.phone ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-sm' : 'bg-slate-100 text-slate-400'} p-5 rounded-3xl font-bold flex flex-col items-center justify-center gap-3 transition-colors`}
            onClick={() => {
              if (stop.phone) {
                window.location.href = buildPhoneCallUrl(stop.phone);
              } else {
                alert("Đơn này không có số điện thoại!");
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-lg">Gọi Khách</span>
          </button>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 max-w-md md:max-w-2xl mx-auto z-20 flex flex-col gap-3 pb-safe-offset-4 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] md:left-64">
        <div className="flex gap-3">
          <button 
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 active:bg-slate-300 py-4 rounded-2xl font-bold text-lg transition-colors border border-slate-200"
            onClick={() => updateStopStatus("cancelled")}
          >
            Bỏ qua
          </button>
          <button 
            className="flex-[2] bg-orange-600 text-white py-4 rounded-2xl font-black text-xl shadow-lg shadow-orange-600/30 active:scale-95 transition-transform"
            onClick={() => updateStopStatus("delivered")}
          >
            ĐÃ GIAO
          </button>
        </div>
        <div className="flex justify-between items-center px-2">
          <button 
            className={`p-3 font-bold flex items-center gap-1 rounded-xl transition-colors ${currentIndex > 0 ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300'}`}
            onClick={() => navigateStop(-1)}
            disabled={currentIndex === 0}
            aria-label="Đơn giao trước đó"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Đơn trước
          </button>
          <button 
            className={`p-3 font-bold flex items-center gap-1 rounded-xl transition-colors ${currentIndex < route.stops.length - 1 ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300'}`}
            onClick={() => navigateStop(1)}
            disabled={currentIndex === route.stops.length - 1}
            aria-label="Đơn giao tiếp theo"
          >
            Đơn tiếp
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
