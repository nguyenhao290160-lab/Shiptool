"use client";

import React from "react";
import { GoogleMapLoadStatus } from "@/lib/types";

interface Props {
  status: GoogleMapLoadStatus;
  isOnline: boolean;
  hasApiKey: boolean;
  markerCount: number;
  missingCoordsCount: number;
  totalOrders: number;
}

export const MapStatusPanel = ({
  status,
  isOnline: online,
  hasApiKey: apiKey,
  markerCount,
  missingCoordsCount,
  totalOrders,
}: Props) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
        <span className="w-2 h-5 bg-cyan-500 rounded-full" />
        Trạng thái bản đồ
      </h3>

      <div className="grid grid-cols-2 gap-2.5">
        {/* API Key status */}
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              apiKey ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              API Key
            </p>
            <p className="text-xs font-bold text-slate-800 truncate">
              {apiKey ? "Đã cấu hình" : "Chưa có"}
            </p>
          </div>
        </div>

        {/* Network status */}
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              online ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Mạng
            </p>
            <p className="text-xs font-bold text-slate-800">
              {online ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Markers showing */}
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
          <span className="w-2 h-2 rounded-full shrink-0 bg-cyan-400" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Marker
            </p>
            <p className="text-xs font-bold text-slate-800">
              {markerCount} / {totalOrders} đơn
            </p>
          </div>
        </div>

        {/* Missing coords */}
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              missingCoordsCount > 0 ? "bg-amber-400" : "bg-emerald-400"
            }`}
          />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Thiếu GPS
            </p>
            <p className="text-xs font-bold text-slate-800">
              {missingCoordsCount} đơn
            </p>
          </div>
        </div>
      </div>

      {/* Map load status line */}
      <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-slate-500">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            status === "ready"
              ? "bg-emerald-400"
              : status === "loading"
                ? "bg-cyan-400 animate-pulse"
                : status === "error"
                  ? "bg-red-400"
                  : "bg-slate-300"
          }`}
        />
        {status === "ready" && "Bản đồ đã tải thành công"}
        {status === "loading" && "Đang tải Google Maps..."}
        {status === "error" && "Google Maps load lỗi"}
        {status === "offline" && "Đang offline — bản đồ không khả dụng"}
        {status === "missing-api-key" && "Cần cấu hình API key"}
        <span className="ml-auto text-slate-400">Dữ liệu local</span>
      </div>
    </div>
  );
};
