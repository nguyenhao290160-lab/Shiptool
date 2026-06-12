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
    <div className={`${bgColor} rounded-2xl p-${isSm ? 3 : 4} border border-slate-200`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-${isSm ? "xs" : "sm"} text-slate-600 font-medium`}>{label}</p>
          <p className={`text-${isSm ? "xl" : "2xl"} font-bold ${textColor} mt-1`}>{value}</p>
        </div>
        <div className={`text-${isSm ? "2xl" : "4xl"}`}>{icon}</div>
      </div>
    </div>
  );
}
