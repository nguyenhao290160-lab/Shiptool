"use client";

import React from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineStatusBanner() {
  const isOnline = useOnlineStatus();

  // Don't show anything while loading
  if (isOnline === null) {
    return null;
  }

  // Don't show if online
  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-yellow-50 border-b border-yellow-200 shadow-sm">
      <div className="px-4 py-3 flex items-start gap-3 max-w-6xl mx-auto">
        <div className="flex-shrink-0 pt-0.5">
          <svg
            className="h-5 w-5 text-yellow-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.111 16H5m6.666 0h2.889m2.89-10H19m-4.363-3.12a4 4 0 00-8.107 1.007M3 20h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-yellow-900">Chế độ Offline</h3>
          <p className="text-sm text-yellow-800 mt-1">
            Bạn đang ở chế độ offline/local. Dữ liệu đơn giao và tuyến local vẫn dùng được, nhưng Google Maps và các API Google có thể không hoạt động.
          </p>
        </div>
      </div>
    </div>
  );
}
