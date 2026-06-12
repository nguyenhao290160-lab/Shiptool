"use client";

import React, { useState } from "react";

export function PwaInstallHint() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-r">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-blue-900">Cài đặt ShipRoute AI</h3>
          <p className="text-sm text-blue-800 mt-1 mb-3">
            Bạn có thể cài ShipRoute AI như một app trên trình duyệt để mở nhanh hơn. Dữ liệu vẫn được lưu cục bộ trên thiết bị này.
          </p>
          <p className="text-xs text-blue-700 mb-3">
            <strong>Hướng dẫn:</strong> Menu ba chấm (⋯) → Cài đặt ứng dụng / Install app
          </p>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 -ml-2 rounded hover:bg-blue-100 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
