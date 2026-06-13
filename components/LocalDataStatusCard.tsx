"use client";

import React from "react";
import { formatBytes } from "@/lib/settingsUtils";

interface LocalDataStatusCardProps {
  ordersCount: number;
  routesCount: number;
  storageSize: number;
  storageKeys: string[];
}

export function LocalDataStatusCard({
  ordersCount,
  routesCount,
  storageSize,
  storageKeys,
}: LocalDataStatusCardProps) {
  const usagePercent = Math.min((storageSize / 5120) * 100, 100);

  return (
    <div className="space-y-3">
      {/* Data Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/30 rounded-xl p-4 border border-cyan-200/60">
          <p className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-1.5">Đơn giao</p>
          <p className="font-black text-2xl text-cyan-700">{ordersCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">đơn đang lưu</p>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-violet-100/30 rounded-xl p-4 border border-violet-200/60">
          <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1.5">Tuyến đường</p>
          <p className="font-black text-2xl text-violet-700">{routesCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">tuyến đang lưu</p>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-700 font-semibold">Dung lượng lưu trữ</p>
          <p className="font-bold text-sm text-slate-900">
            {formatBytes(Math.round(storageSize * 1024))}
          </p>
        </div>
        <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${usagePercent}%`,
              background: usagePercent > 80 ? "linear-gradient(90deg, #f97316, #ef4444)" : "linear-gradient(90deg, #0ea5e9, #6366f1)",
            }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1.5">~5 MB khả dụng</p>
      </div>

      {/* Storage Keys */}
      {storageKeys.length > 0 && (
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
          <p className="text-sm text-slate-700 font-semibold mb-3">Storage keys</p>
          <div className="flex flex-wrap gap-1.5">
            {storageKeys.map((key) => (
              <span
                key={key}
                className="bg-white rounded-lg px-2.5 py-1 text-xs font-mono text-slate-600 border border-slate-200/80"
              >
                {key}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-sky-700 bg-sky-50/60 border border-sky-200/60 rounded-lg p-3 leading-relaxed">
        💡 Tất cả dữ liệu được lưu trên máy của bạn, không upload lên server.
      </p>
    </div>
  );
}
