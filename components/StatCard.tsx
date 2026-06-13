"use client";

import React from "react";

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
  size?: "sm" | "md";
}

export function StatCard({
  icon,
  label,
  value,
  bgColor,
  textColor,
  size = "md",
}: StatCardProps) {
  const isSm = size === "sm";

  return (
    <div className={`${bgColor} rounded-xl border border-slate-200/60 ${isSm ? "p-3" : "p-4"}`} style={{ boxShadow: "var(--shadow-sm)" }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-slate-600 font-semibold ${isSm ? "text-xs" : "text-sm"}`}>{label}</p>
          <p className={`font-black ${textColor} mt-1 ${isSm ? "text-xl" : "text-2xl"}`}>{value}</p>
        </div>
        <div className={`${isSm ? "text-2xl" : "text-3xl"}`}>{icon}</div>
      </div>
    </div>
  );
}
