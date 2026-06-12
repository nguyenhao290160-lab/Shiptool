"use client";

import React from "react";
import { RoutePoint, StartPoint } from "@/lib/types";
import {
  countHighPriority,
  countMissingCoords,
  totalRouteDistanceKm,
} from "@/lib/routeUtils";

interface Props {
  points: RoutePoint[];
  startPoint?: StartPoint;
}

export const RouteStats = ({ points, startPoint }: Props) => {
  const total = points.length;
  const highPrio = countHighPriority(points);
  const missingGps = countMissingCoords(points);
  const distKm = totalRouteDistanceKm(
    points,
    startPoint?.lat,
    startPoint?.lng
  );

  const stats: { label: string; value: string; cls: string }[] = [
    {
      label: "Điểm giao",
      value: String(total),
      cls: "bg-cyan-50 border-cyan-200",
    },
    {
      label: "Ưu tiên cao",
      value: String(highPrio),
      cls: "bg-red-50 border-red-200",
    },
    {
      label: "Thiếu GPS",
      value: String(missingGps),
      cls:
        missingGps > 0
          ? "bg-amber-50 border-amber-200"
          : "bg-emerald-50 border-emerald-200",
    },
    {
      label: "Khoảng cách",
      value: distKm != null ? `~${distKm} km` : "—",
      cls: "bg-slate-50 border-slate-200",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-xl border p-2.5 flex flex-col items-center justify-center text-center ${s.cls}`}
        >
          <span className="text-lg font-black text-slate-900 leading-none">
            {s.value}
          </span>
          <span className="text-[10px] font-semibold text-slate-600 mt-1 leading-tight">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
};
