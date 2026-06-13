"use client";

import React from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface SystemStatusCardProps {
  swSupported?: boolean;
  swRegistered?: boolean;
}

export function SystemStatusCard({ swSupported = false, swRegistered = false }: SystemStatusCardProps) {
  const isOnline = useOnlineStatus();

  return (
    <div className="space-y-3">
      {/* Online Status */}
      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-700 font-semibold">Kết nối internet</p>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isOnline
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${isOnline ? "bg-emerald-500" : "bg-amber-500"}`} />
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          {isOnline
            ? "App có kết nối internet. Tất cả tính năng sẵn sàng."
            : "Bạn đang ở chế độ offline. Dữ liệu local vẫn hoạt động bình thường."}
        </p>
      </div>

      {/* Service Worker Support */}
      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-700 font-semibold">Service Worker</p>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              swSupported
                ? swRegistered
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {swSupported
              ? swRegistered
                ? "✓ Đã đăng ký"
                : "⚠ Chưa đăng ký"
              : "✗ Không hỗ trợ"}
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          {swSupported
            ? swRegistered
              ? "Service worker đang chạy. App được tối ưu hóa."
              : "Trình duyệt hỗ trợ nhưng chưa đăng ký."
            : "Trình duyệt này không hỗ trợ PWA."}
        </p>
      </div>

      {/* PWA Installation Hint */}
      <div className="bg-sky-50/60 border border-sky-200/80 rounded-xl p-4">
        <p className="text-sm font-bold text-sky-900 mb-2 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-xs">💡</span>
          Cài đặt ứng dụng
        </p>
        <p className="text-xs text-sky-800 leading-relaxed">
          Nếu trình duyệt hỗ trợ, bạn có thể cài ShipRoute AI như một ứng dụng:
          <br />
          <strong>Chrome/Edge:</strong> Mở menu ba chấm → &quot;Cài đặt ứng dụng&quot; hoặc &quot;Install app&quot;
          <br />
          <strong>Safari iOS:</strong> Chia sẻ → &quot;Thêm vào màn hình chính&quot;
        </p>
      </div>
    </div>
  );
}
