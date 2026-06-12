"use client";

import React from "react";
import { GoogleMapLoadStatus } from "@/lib/types";

interface Props {
  status: GoogleMapLoadStatus;
}

const CONFIG: Record<
  GoogleMapLoadStatus,
  { icon: React.ReactNode; title: string; desc: string; cls: string }
> = {
  "missing-api-key": {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    title: "Chưa cấu hình Google Maps API Key",
    desc: "Hãy thêm NEXT_PUBLIC_GOOGLE_MAPS_API_KEY vào file .env.local để sử dụng bản đồ.",
    cls: "text-amber-600 bg-amber-50 border-amber-200",
  },
  loading: {
    icon: (
      <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
    ),
    title: "Đang tải bản đồ...",
    desc: "Vui lòng chờ trong giây lát.",
    cls: "text-cyan-700 bg-cyan-50 border-cyan-200",
  },
  ready: {
    icon: null,
    title: "",
    desc: "",
    cls: "",
  },
  error: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    title: "Không thể tải Google Maps",
    desc: "Bạn vẫn có thể dùng danh sách đơn và lập tuyến local. Kiểm tra API key hoặc kết nối mạng.",
    cls: "text-red-600 bg-red-50 border-red-200",
  },
  offline: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a5 5 0 01-1.414-3.536m1.414 3.536L3 21m4.243-4.243a5 5 0 017.072 0" />
      </svg>
    ),
    title: "Đang offline",
    desc: "Không thể tải Google Maps. Bạn vẫn có thể dùng danh sách đơn và lập tuyến local.",
    cls: "text-slate-600 bg-slate-50 border-slate-200",
  },
};

export const MapFallback = ({ status }: Props) => {
  if (status === "ready") return null;

  const cfg = CONFIG[status];

  return (
    <div
      className={`w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center px-6 py-12 ${cfg.cls} min-h-[320px] md:min-h-[400px]`}
    >
      <div className="mb-4">{cfg.icon}</div>
      <h3 className="text-lg font-bold mb-2">{cfg.title}</h3>
      <p className="text-sm font-medium max-w-sm leading-relaxed opacity-80">
        {cfg.desc}
      </p>
      {status === "missing-api-key" && (
        <code className="mt-4 text-xs bg-white/80 px-3 py-2 rounded-lg border border-amber-300 text-amber-800 font-mono">
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
        </code>
      )}
    </div>
  );
};
