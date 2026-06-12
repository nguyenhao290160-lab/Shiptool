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
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-600 font-medium">Kết nối internet</p>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isOnline
                ? "bg-green-200 text-green-900"
                : "bg-orange-200 text-orange-900"
            }`}
          >
            {isOnline ? "🟢 Online" : "🟠 Offline"}
          </span>
        </div>
        <p className="text-xs text-slate-600">
          {isOnline
            ? "App có kết nối internet. Tất cả tính năng sẵn sàng."
            : "Bạn đang ở chế độ offline. Dữ liệu local vẫn hoạt động bình thường."}
        </p>
      </div>

      {/* Service Worker Support */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-600 font-medium">Service Worker</p>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              swSupported
                ? swRegistered
                  ? "bg-green-200 text-green-900"
                  : "bg-yellow-200 text-yellow-900"
                : "bg-gray-200 text-gray-900"
            }`}
          >
            {swSupported
              ? swRegistered
                ? "✓ Đã đăng ký"
                : "⚠️ Chưa đăng ký"
              : "✗ Không hỗ trợ"}
          </span>
        </div>
        <p className="text-xs text-slate-600">
          {swSupported
            ? swRegistered
              ? "Service worker đang chạy. App được tối ưu hóa."
              : "Trình duyệt hỗ trợ nhưng chưa đăng ký."
            : "Trình duyệt này không hỗ trợ PWA."}
        </p>
      </div>

      {/* PWA Installation Hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">💡 Cài đặt ứng dụng</p>
        <p className="text-xs text-blue-900 leading-relaxed">
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
