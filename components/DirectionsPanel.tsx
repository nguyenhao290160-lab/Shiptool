"use client";

import React from "react";
import { DirectionsResult } from "@/lib/directions";

interface Props {
  directions: DirectionsResult | null;
  isLoading?: boolean;
  error?: string | null;
  onDrawRoute?: () => Promise<void>;
  onClearRoute?: () => void;
}

export const DirectionsPanel = ({
  directions,
  isLoading = false,
  error = null,
  onDrawRoute,
  onClearRoute,
}: Props) => {
  if (!directions && !error && !isLoading) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-cyan-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19l-7-7 7-7m8 7a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Tuyến đường
        </h3>
        {directions && (
          <button
            onClick={onClearRoute}
            className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
            title="Xóa tuyến trên bản đồ"
          >
            ✕
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-5 bg-red-50 border-t border-red-100">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="p-5 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Đang tính tuyến đường...</p>
        </div>
      )}

      {/* Directions info */}
      {directions && (
        <div className="p-5 flex flex-col gap-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-cyan-50 rounded-xl p-3 border border-cyan-100">
              <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-1">
                Quãng đường
              </p>
              <p className="text-lg font-bold text-cyan-900">{directions.totalDistance}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                Thời gian
              </p>
              <p className="text-lg font-bold text-emerald-900">{directions.totalDuration}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                Số chặng
              </p>
              <p className="text-lg font-bold text-amber-900">{directions.legs.length}</p>
            </div>
          </div>

          {/* Legs list */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Chi tiết từng chặng
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {directions.legs.map((leg, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col gap-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-500 mb-1">
                        Chặng {idx + 1}
                      </p>
                      <p className="text-xs font-medium text-slate-700 leading-snug truncate">
                        {leg.start} → {leg.end}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-600 font-medium">{leg.distance}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">{leg.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action button */}
          {onDrawRoute && (
            <button
              onClick={onDrawRoute}
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-400 text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
            >
              Vẽ tuyến trên bản đồ
            </button>
          )}
        </div>
      )}
    </div>
  );
};
