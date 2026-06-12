"use client";

import React from "react";

interface SystemHealthCheckProps {
  apiKeyConfigured: boolean;
  isOnline: boolean;
  hasOrders: boolean;
  hasRoutes: boolean;
  hasBackup: boolean;
  swSupported: boolean;
  localStorageAvailable: boolean;
}

export function SystemHealthCheck({
  apiKeyConfigured,
  isOnline,
  hasOrders,
  hasRoutes,
  hasBackup,
  swSupported,
  localStorageAvailable,
}: SystemHealthCheckProps) {
  const checks = [
    {
      label: "localStorage hoạt động",
      status: localStorageAvailable,
      icon: "💾",
    },
    {
      label: "API key được cấu hình",
      status: apiKeyConfigured,
      icon: "🔑",
    },
    {
      label: "Đang online",
      status: isOnline,
      icon: "🟢",
    },
    {
      label: "Có dữ liệu đơn giao",
      status: hasOrders,
      icon: "📦",
    },
    {
      label: "Có dữ liệu tuyến đường",
      status: hasRoutes,
      icon: "🗺️",
    },
    {
      label: "Có dữ liệu backup",
      status: hasBackup,
      icon: "💾",
    },
    {
      label: "PWA/Service Worker hỗ trợ",
      status: swSupported,
      icon: "⚙️",
    },
  ];

  const passedCount = checks.filter((c) => c.status).length;
  const totalCount = checks.length;

  return (
    <div className="space-y-3">
      {/* Health Score */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-4 border border-cyan-200">
        <p className="text-sm text-slate-600 font-medium mb-2">Tình trạng hệ thống</p>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white border-2 border-cyan-600 flex items-center justify-center">
            <p className="font-bold text-xl text-cyan-600">{passedCount}/{totalCount}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">
              {passedCount === totalCount ? "✓ Tốt" : passedCount >= 5 ? "⚠️ Chấp nhận được" : "❌ Cần kiểm tra"}
            </p>
            <p className="text-xs text-slate-600">
              {passedCount} trên {totalCount} mục kiểm tra
            </p>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
        {checks.map((check, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span
              className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                check.status
                  ? "bg-green-200 text-green-900"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {check.status ? "✓" : "✗"}
            </span>
            <span className="text-sm text-slate-700 flex-1">{check.label}</span>
            <span className="text-lg">{check.icon}</span>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {passedCount < totalCount && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-yellow-900 mb-2">💡 Gợi ý</p>
          <ul className="text-xs text-yellow-900 space-y-1">
            {!apiKeyConfigured && (
              <li>• Cấu hình Google Maps API key trong file .env.local</li>
            )}
            {!hasOrders && (
              <li>• Thêm đơn giao mới trong Quản lý đơn</li>
            )}
            {!hasRoutes && (
              <li>• Tạo tuyến đường mới trong Lập tuyến</li>
            )}
            {!hasBackup && (
              <li>• Tạo backup dữ liệu trong Backup dữ liệu</li>
            )}
            {!swSupported && (
              <li>• Dùng trình duyệt hiện đại để có hỗ trợ PWA</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
