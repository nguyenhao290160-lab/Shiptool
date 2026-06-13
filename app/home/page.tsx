"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BigActionButton } from "@/components/BigActionButton";
import { SummaryCard } from "@/components/SummaryCard";
import { PerformanceDashboard } from "@/components/PerformanceDashboard";
import { getActiveRoute } from "@/lib/storage";
import { RoutePlan } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RoutePlan | null>(null);
  const [stats, setStats] = useState({ total: 0, delivered: 0, pending: 0 });
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const route = getActiveRoute();
      setActiveRoute(route);
      
      if (route) {
        const total = route.stops.length;
        const delivered = route.stops.filter((s) => s.status === "delivered").length;
        const pending = route.stops.filter((s) => s.status === "pending").length;
        setStats({ total, delivered, pending });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return (
      <div className="page-container">
        <div className="p-6 text-center" />
      </div>
    );
  }

  return (
    <div className="page-container bg-decorative">
      <main className="flex-1 p-4 md:p-6 flex flex-col gap-6 pb-24">
        {showDashboard ? (
          <div className="space-y-5 animate-fade-in">
            <button
              onClick={() => setShowDashboard(false)}
              className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold text-sm transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            <PerformanceDashboard />
          </div>
        ) : (
          <>
            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-center" style={{ background: "var(--gradient-hero)" }}>
              {/* Decorative blurs */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-cyan-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Hệ thống sẵn sàng
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
                  ShipRoute <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">AI</span>
                </h1>
                <p className="text-slate-300 font-medium text-sm md:text-base">
                  Trợ lý sắp tuyến giao hàng thông minh
                </p>
              </div>
            </div>

            {/* ── Today's Route Card ── */}
            <div className="card-premium animate-fade-in-up">
              <h2 className="font-bold text-lg mb-4 text-slate-900 flex items-center gap-2.5">
                <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-orange-500 to-orange-600 inline-block" />
                Tuyến hôm nay
              </h2>
              {activeRoute ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <SummaryCard title="Tổng đơn" value={stats.total} />
                  <SummaryCard title="Đã giao" value={stats.delivered} />
                  <SummaryCard title="Chưa giao" value={stats.pending} />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-8 text-center border border-dashed border-slate-300/80 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 text-slate-400 border border-slate-200" style={{ boxShadow: "var(--shadow-sm)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <p className="text-slate-800 font-bold text-base mb-1">Chưa có tuyến đang giao</p>
                  <p className="text-slate-500 text-sm">Bấm &quot;Tạo tuyến mới&quot; để bắt đầu ngày làm việc.</p>
                </div>
              )}
            </div>

            {/* ── Quick Actions Grid ── */}
            <div className="stagger-children">
              <h2 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2.5">
                <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-cyan-500 to-cyan-600 inline-block" />
                Thao tác nhanh
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <BigActionButton onClick={() => router.push("/new-route")}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tạo tuyến mới
                </BigActionButton>

                <BigActionButton variant="secondary" onClick={() => router.push("/orders")}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Quản lý đơn giao
                </BigActionButton>

                <BigActionButton variant="secondary" onClick={() => router.push("/route-planner")}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Lập tuyến đường
                </BigActionButton>

                <BigActionButton variant="secondary" onClick={() => setShowDashboard(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Báo cáo hiệu suất
                </BigActionButton>

                {activeRoute && (
                  <BigActionButton variant="success" onClick={() => router.push(`/route/${activeRoute.id}/delivery`)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tiếp tục tuyến đang giao
                  </BigActionButton>
                )}

                <BigActionButton variant="outline" onClick={() => router.push("/history")}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lịch sử tuyến
                </BigActionButton>

                <BigActionButton variant="outline" onClick={() => router.push("/settings")}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Cài đặt
                </BigActionButton>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
