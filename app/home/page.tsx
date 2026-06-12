"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobilePageShell } from "@/components/MobilePageShell";
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
    return <MobilePageShell><div className="text-center py-6"></div></MobilePageShell>;
  }

  return (
    <MobilePageShell>
      {showDashboard ? (
        <div className="space-y-5">
          <button
            onClick={() => setShowDashboard(false)}
            className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold text-sm mb-4"
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
          <div className="text-center py-6 pb-2">
            <h1 className="text-4xl font-black text-orange-600 mb-2 tracking-tight">ShipRoute <span className="text-slate-900">AI</span></h1>
            <p className="text-slate-600 font-medium">Trợ lý sắp tuyến giao hàng</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 mb-2">
            <h2 className="font-bold text-xl mb-4 text-slate-900 flex items-center gap-2">
              <span className="w-2 h-6 bg-orange-500 rounded-full inline-block"></span>
              Tuyến hôm nay
            </h2>
            {activeRoute ? (
              <div className="grid grid-cols-2 gap-3">
                <SummaryCard title="Tổng đơn" value={stats.total} />
                <SummaryCard title="Đã giao" value={stats.delivered} />
                <div className="col-span-2">
                  <SummaryCard title="Chưa giao" value={stats.pending} />
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-300 flex flex-col items-center justify-center">
                 <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                 </div>
                 <p className="text-slate-800 font-bold text-lg mb-1">Chưa có tuyến đang giao</p>
                 <p className="text-slate-500 text-sm">Bấm &quot;Tạo tuyến mới&quot; để bắt đầu ngày làm việc.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <BigActionButton onClick={() => router.push("/new-route")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo tuyến mới
            </BigActionButton>

            <BigActionButton variant="secondary" onClick={() => router.push("/orders")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Quản lý đơn giao
            </BigActionButton>

            <BigActionButton variant="secondary" onClick={() => router.push("/route-planner")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Lập tuyến đường
            </BigActionButton>

            <BigActionButton variant="secondary" onClick={() => setShowDashboard(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Báo cáo hiệu suất
            </BigActionButton>
            
            {activeRoute && (
              <BigActionButton variant="success" onClick={() => router.push(`/route/${activeRoute.id}/delivery`)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tiếp tục tuyến đang giao
              </BigActionButton>
            )}

            <BigActionButton variant="outline" onClick={() => router.push("/history")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lịch sử tuyến
            </BigActionButton>

            <BigActionButton variant="outline" onClick={() => router.push("/settings")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Cài đặt
            </BigActionButton>
          </div>
        </>
      )}
    </MobilePageShell>
  );
}
