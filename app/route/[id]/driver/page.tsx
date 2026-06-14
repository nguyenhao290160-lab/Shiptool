"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { MobilePageShell } from "@/components/MobilePageShell";
import { getRouteById, saveRoute } from "@/lib/storage";
import { RoutePlan, OrderStop, DeliveryOrder } from "@/lib/types";
import { getDeliveryOrderById, saveDeliveryOrder } from "@/lib/deliveryStorage";
import { buildGoogleMapsDirectionsUrl, buildGoogleMapsSearchUrl } from "@/lib/maps";
import { buildPhoneCallUrl } from "@/lib/phone";

export default function DriverPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = use(params);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [route, setRoute] = useState<RoutePlan | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsMounted(true);
      const r = getRouteById(resolved.id);
      if (!r) {
        router.replace("/home");
        return;
      }
      setRoute(r);
      // find first not completed stop
      const firstOpen = r.stops.findIndex((s) => !["delivered", "failed", "cancelled", "skipped"].includes(s.status));
      setCurrentIndex(firstOpen >= 0 ? firstOpen : (r.stops.length > 0 ? r.currentStopIndex : null));
    }, 0);
    return () => clearTimeout(t);
  }, [resolved.id, router]);

  if (!isMounted) return <MobilePageShell><div className="p-5" /></MobilePageShell>;
  if (!route) return <MobilePageShell><p>Không tìm thấy tuyến.</p></MobilePageShell>;

  const total = route.stops.length;
  const deliveredCount = route.stops.filter((s) => s.status === "delivered").length;
  const failedCount = route.stops.filter((s) => s.status === "failed").length;

  const idx = currentIndex ?? route.currentStopIndex ?? 0;
  const stop = route.stops[idx];
  const nextStop = route.stops[idx + 1];

  const updateStop = (updated: OrderStop, advance: boolean = true) => {
    const updatedStops = route.stops.map((s, i) => (i === idx ? updated : s));
    const nextIdx = advance ? Math.min(idx + 1, updatedStops.length - 1) : idx;
    const newStatus: RoutePlan["status"] = updatedStops.every((s) => !["pending", "ready"].includes(s.status)) ? "completed" : route.status;
    const newRoute: RoutePlan = { ...route, stops: updatedStops, currentStopIndex: nextIdx, status: newStatus };
    saveRoute(newRoute);
    setRoute(newRoute);
    setCurrentIndex(nextIdx);

    // update master order if exists
    try {
      const master = getDeliveryOrderById(updated.id);
      if (master) {
        const merged: DeliveryOrder = {
          ...master,
          status: updated.status as DeliveryOrder["status"],
          updatedAt: new Date().toISOString(),
          deliveredAt: updated.deliveredAt ?? master.deliveredAt,
          failedAt: updated.failedAt ?? master.failedAt,
          deliveryNote: updated.deliveryNote ?? master.deliveryNote,
          failureReason: updated.failureReason ?? master.failureReason,
          recipientName: updated.recipientName ?? master.recipientName,
        };
        saveDeliveryOrder(merged);
      }
    } catch {
      // non-critical
    }
  };

  const handleStart = () => {
    if (!stop) return;
    const now = new Date().toISOString();
    const updated: OrderStop = { ...stop, status: "delivering", updatedAt: now };
    updateStop(updated, false);
  };

  const handleDelivered = () => {
    if (!stop) return;
    const now = new Date().toISOString();
    const recipient = window.prompt("Tên người nhận (tùy chọn)", stop.recipientName || "") || undefined;
    const note = window.prompt("Ghi chú giao (tùy chọn)", stop.deliveryNote || "") || undefined;
    const updated: OrderStop = { ...stop, status: "delivered", deliveredAt: now, recipientName: recipient, deliveryNote: note, updatedAt: now };
    updateStop(updated, true);
  };

  const handleFailed = () => {
    if (!stop) return;
    const now = new Date().toISOString();
    const reason = window.prompt("Lý do giao thất bại (ví dụ: khách vắng)", stop.failureReason || "") || undefined;
    const updated: OrderStop = { ...stop, status: "failed", failedAt: now, failureReason: reason, updatedAt: now };
    updateStop(updated, true);
  };

  const openNavigation = () => {
    if (!stop) return;
    // Prefer coordinates from central delivery order if available, otherwise fallback to address
    const master = getDeliveryOrderById(stop.id);
    const url = master && typeof master.lat === "number" && typeof master.lng === "number"
      ? buildGoogleMapsDirectionsUrl(master.lat, master.lng)
      : (stop.address ? buildGoogleMapsSearchUrl(stop.address) : "https://www.google.com/maps");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const callCustomer = () => {
    if (!stop?.phone) {
      alert("Đơn này không có số điện thoại!");
      return;
    }
    window.location.href = buildPhoneCallUrl(stop.phone);
  };

  return (
    <MobilePageShell title={`Chế độ lái - ${route.name || route.id}`} showBack>
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-slate-500 font-bold">Tiến độ tuyến</div>
              <div className="text-xl font-black">{deliveredCount}/{total} đã giao</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Thất bại</div>
              <div className="text-lg font-semibold text-red-600">{failedCount}</div>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className="h-3 bg-emerald-500" style={{ width: `${Math.round((deliveredCount / Math.max(1, total)) * 100)}%` }} />
          </div>
        </div>

        {stop ? (
          <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-xs text-slate-500 font-bold">Điểm {idx + 1}</div>
                <h2 className="text-2xl font-black">{stop.receiverName || stop.label}</h2>
                <div className="text-sm text-slate-600 mt-1">{stop.address}</div>
              </div>
              <div className="text-sm font-bold px-3 py-1 rounded-full bg-slate-50 text-slate-700">{stop.status}</div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={openNavigation} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold" aria-label="Mở chỉ đường">Mở Google Maps</button>
              <button onClick={callCustomer} className={`flex-1 ${stop.phone ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'} py-3 rounded-2xl font-bold`} aria-label="Gọi khách">Gọi khách</button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <button onClick={handleStart} className="py-3 rounded-xl bg-slate-100 font-semibold">Bắt đầu</button>
              <button onClick={handleDelivered} className="py-3 rounded-xl bg-emerald-500 text-white font-black">Đã giao</button>
              <button onClick={handleFailed} className="py-3 rounded-xl bg-red-500 text-white font-black">Giao thất bại</button>
            </div>

            {stop.note && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-xl text-sm text-slate-700">
                <strong>Ghi chú:</strong> {stop.note}
              </div>
            )}

            {nextStop && (
              <div className="mt-4 border-t pt-3 text-sm text-slate-600">
                <div className="font-bold">Điểm tiếp theo</div>
                <div className="truncate">{nextStop.receiverName || nextStop.label} • {nextStop.address}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-slate-600">Tuyến không có điểm dừng.</div>
        )}

        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200">
          <div className="text-sm font-bold mb-2">Danh sách điểm</div>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {route.stops.map((s, i) => (
              <div key={s.id} className={`p-3 rounded-xl flex justify-between items-center ${i === idx ? 'ring-2 ring-sky-200 bg-sky-50' : 'bg-white'}`}>
                <div>
                  <div className="text-sm font-bold">{i + 1}. {s.receiverName || s.label}</div>
                  <div className="text-xs text-slate-500 truncate">{s.address}</div>
                </div>
                <div className="text-xs text-slate-700 font-semibold">{s.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobilePageShell>
  );
}


