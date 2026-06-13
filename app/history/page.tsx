"use client";

import React, { useEffect, useState } from "react";
import { MobilePageShell } from "@/components/MobilePageShell";
import { LocalDataBackupPanel } from "@/components/LocalDataBackupPanel";
import { getRouteHistory, deleteRouteHistoryItem, updateRouteHistoryItem } from "@/lib/routeHistoryStorage";
import { RouteHistoryItem } from "@/lib/types";

export default function HistoryPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [routes, setRoutes] = useState<RouteHistoryItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      setRoutes(getRouteHistory().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDataImported = () => {
    // Reload routes after data import
    setRoutes(getRouteHistory().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };



  if (!isMounted) {
    return <MobilePageShell title="Lịch sử tuyến" showBack><div className="p-5"></div></MobilePageShell>;
  }

  // ── Summary stats ───────────────────────────────────────────────
  const totalRoutes = routes.length;
  const totalCompleted = routes.filter((r) => r.status === "completed").length;
  const totalOrders = routes.reduce((s, r) => s + (r.totalOrders || 0), 0);
  const totalDistanceMeters = routes.reduce((s, r) => s + (r.totalDistanceMeters || 0), 0);

  return (
    <MobilePageShell title="Lịch sử tuyến" showBack>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-cyan-50 rounded-xl border border-cyan-100 p-3">
          <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-1">Tổng tuyến</p>
          <p className="text-lg font-bold text-cyan-900">{totalRoutes}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-3">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Hoàn thành</p>
          <p className="text-lg font-bold text-emerald-900">{totalCompleted}</p>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Tổng đơn</p>
          <p className="text-lg font-bold text-slate-900">{totalOrders}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-3">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Tổng km</p>
          <p className="text-lg font-bold text-amber-900">{totalDistanceMeters ? `${Math.round(totalDistanceMeters/1000)} km` : '—'}</p>
        </div>
      </div>
      {routes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Không có lịch sử tuyến nào.</p>
        </div>
        ) : (
        <div className="flex flex-col gap-4">
          {routes.map((route) => {
            const total = route.points.length;
            const delivered = route.deliveredOrders;
            return (
              <div key={route.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{route.name}</h3>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(route.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${route.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : route.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                      {route.status === 'completed' ? 'Hoàn thành' : route.status === 'in_progress' ? 'Đang chạy' : route.status === 'draft' ? 'Nháp' : 'Đã hủy'}
                    </span>
                    <button onClick={() => setExpanded(expanded === route.id ? null : route.id)} className="text-xs text-slate-600 font-medium">{expanded === route.id ? 'Thu gọn' : 'Xem'}</button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl flex justify-between items-center border border-slate-100">
                  <span className="text-slate-600 font-bold">Tiến độ:</span>
                  <span className="font-black text-lg text-slate-900">{delivered} / {total} đơn</span>
                </div>

                {expanded === route.id && (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-700">
                      <p className="font-semibold">Ghi chú:</p>
                      <p className="text-slate-600">{route.note || '-'} </p>
                    </div>

                    <div className="text-sm">
                      <p className="font-semibold mb-2">Danh sách điểm ({route.points.length})</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {route.points.map((p) => (
                          <div key={p.orderId} className="p-3 bg-white border border-slate-100 rounded-lg">
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{p.sequence}. {p.customerName}</p>
                                <p className="text-xs text-slate-500 truncate">{p.address}</p>
                                <p className="text-xs text-slate-500">{p.phone}</p>
                              </div>
                              <div className="text-xs font-semibold text-slate-600">{p.status}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newStatus = route.status === 'completed' ? 'draft' : 'completed';
                          if (newStatus === 'completed' && !confirm('Đánh dấu tuyến là hoàn thành?')) return;
                          updateRouteHistoryItem(route.id, { status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined });
                          setRoutes(getRouteHistory().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                        }}
                        className="flex-1 bg-cyan-50 text-cyan-700 py-2 rounded-xl font-bold"
                      >
                        {route.status === 'completed' ? 'Đánh dấu Nháp' : 'Đánh dấu Hoàn thành'}
                      </button>
                      <button
                        onClick={() => {
                          const newNote = window.prompt('Sửa ghi chú', route.note || '') || route.note;
                          updateRouteHistoryItem(route.id, { note: newNote });
                          setRoutes(getRouteHistory().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                        }}
                        className="bg-slate-100 text-slate-700 py-2 px-3 rounded-xl font-bold"
                      >
                        Sửa ghi chú
                      </button>
                      <button
                        onClick={() => {
                          if (!confirm('Bạn có chắc muốn xóa lịch sử tuyến này không?')) return;
                          deleteRouteHistoryItem(route.id);
                          setRoutes(getRouteHistory().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                        }}
                        className="bg-red-50 text-red-600 py-2 px-3 rounded-xl font-bold"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Local Data Backup Section ── */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <LocalDataBackupPanel onDataImported={handleDataImported} />
      </div>
    </MobilePageShell>
  );
}
