"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobilePageShell } from "@/components/MobilePageShell";
import { LocalDataBackupPanel } from "@/components/LocalDataBackupPanel";
import { getRoutes, deleteRoute } from "@/lib/storage";
import { RoutePlan } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [routes, setRoutes] = useState<RoutePlan[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
       
      setRoutes(getRoutes().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDataImported = () => {
    // Reload routes after data import
    setRoutes(getRoutes().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };



  if (!isMounted) {
    return <MobilePageShell title="Lịch sử tuyến" showBack><div className="p-5"></div></MobilePageShell>;
  }

  return (
    <MobilePageShell title="Lịch sử tuyến" showBack>
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
            const total = route.stops.length;
            const delivered = route.stops.filter(s => s.status === 'delivered').length;
            
            return (
              <div key={route.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3 transition-transform active:scale-95">
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
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${route.status === 'completed' ? 'bg-slate-100 text-slate-700' : 'bg-orange-100 text-orange-700'}`}>
                    {route.status === 'completed' ? 'Đã xong' : 'Đang giao'}
                  </span>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-2xl flex justify-between items-center border border-slate-100">
                  <span className="text-slate-600 font-bold">Tiến độ:</span>
                  <span className="font-black text-lg text-slate-900">{delivered} / {total} đơn</span>
                </div>

                <div className="flex gap-2 mt-1">
                  <button 
                    onClick={() => router.push(`/route/${route.id}/${route.status === 'completed' ? 'orders' : 'delivery'}`)}
                    className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200"
                  >
                    Xem chi tiết
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm("Bạn có chắc muốn xóa tuyến này?")) {
                        deleteRoute(route.id);
                        setRoutes(getRoutes().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                      }
                    }}
                    className="bg-red-50 text-red-600 p-3 rounded-xl font-bold hover:bg-red-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
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
