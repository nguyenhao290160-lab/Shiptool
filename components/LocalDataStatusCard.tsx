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
  return (
    <div className="space-y-3">
      {/* Data Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-200">
          <p className="text-sm text-slate-600 font-medium mb-2">Đơn giao</p>
          <p className="font-bold text-2xl text-cyan-600">{ordersCount}</p>
          <p className="text-xs text-slate-500 mt-1">đơn đang lưu</p>
        </div>

        <div className="bg-cyan-50 rounded-2xl p-4 border border-cyan-200">
          <p className="text-sm text-slate-600 font-medium mb-2">Tuyến đường</p>
          <p className="font-bold text-2xl text-cyan-600">{routesCount}</p>
          <p className="text-xs text-slate-500 mt-1">tuyến đang lưu</p>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
        <p className="text-sm text-slate-600 font-medium mb-2">Dung lượng lưu trữ</p>
        <p className="font-semibold text-slate-900">
          {formatBytes(Math.round(storageSize * 1024))}
        </p>
        <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
          <div
            className="bg-cyan-600 h-2 rounded-full"
            style={{ width: `${Math.min((storageSize / 5120) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-500 mt-2">~5 MB khả dụng</p>
      </div>

      {/* Storage Keys */}
      {storageKeys.length > 0 && (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <p className="text-sm text-slate-600 font-medium mb-3">Storage keys</p>
          <div className="space-y-2">
            {storageKeys.map((key) => (
              <div
                key={key}
                className="bg-white rounded px-2 py-1 text-xs font-mono text-slate-700 border border-slate-200 break-all"
              >
                {key}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-slate-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
        💡 Tất cả dữ liệu được lưu trên máy của bạn, không upload lên server.
      </p>
    </div>
  );
}
