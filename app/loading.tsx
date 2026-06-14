import React from "react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-5">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-cyan-600 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-800">Đang tải dữ liệu...</p>
          <p className="text-xs text-slate-400 font-medium">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    </div>
  );
}
