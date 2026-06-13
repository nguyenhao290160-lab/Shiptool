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
    { label: "localStorage hoạt động", status: localStorageAvailable, icon: "💾" },
    { label: "API key được cấu hình", status: apiKeyConfigured, icon: "🔑" },
    { label: "Đang online", status: isOnline, icon: "🌐" },
    { label: "Có dữ liệu đơn giao", status: hasOrders, icon: "📦" },
    { label: "Có dữ liệu tuyến đường", status: hasRoutes, icon: "🗺️" },
    { label: "Có dữ liệu backup", status: hasBackup, icon: "💾" },
    { label: "PWA/Service Worker hỗ trợ", status: swSupported, icon: "⚙️" },
  ];

  const passedCount = checks.filter((c) => c.status).length;
  const totalCount = checks.length;
  const scorePercent = Math.round((passedCount / totalCount) * 100);

  return (
    <div className="space-y-3">
      {/* Health Score */}
      <div className="bg-gradient-to-r from-cyan-50/80 to-sky-50/80 rounded-xl p-4 border border-cyan-200/60">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle
                cx="32" cy="32" r="28" fill="none"
                stroke={scorePercent === 100 ? "#10b981" : scorePercent >= 70 ? "#0ea5e9" : "#f59e0b"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(scorePercent / 100) * 175.93} 175.93`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-800">
              {passedCount}/{totalCount}
            </span>
          </div>
          <div>
            <p className="font-bold text-slate-900">
              {passedCount === totalCount ? "✓ Tốt" : passedCount >= 5 ? "⚠ Chấp nhận được" : "❌ Cần kiểm tra"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {passedCount} trên {totalCount} mục kiểm tra
            </p>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-1.5" style={{ boxShadow: "var(--shadow-sm)" }}>
        {checks.map((check, idx) => (
          <div key={idx} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${check.status ? "bg-emerald-50/50" : "bg-slate-50/50"}`}>
            <span
              className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                check.status
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-slate-200 text-slate-500 border border-slate-300"
              }`}
            >
              {check.status ? "✓" : "✗"}
            </span>
            <span className="text-sm text-slate-700 flex-1 font-medium">{check.label}</span>
            <span className="text-base">{check.icon}</span>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {passedCount < totalCount && (
        <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4">
          <p className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-xs">💡</span>
            Gợi ý
          </p>
          <ul className="text-xs text-amber-800 space-y-1.5">
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
