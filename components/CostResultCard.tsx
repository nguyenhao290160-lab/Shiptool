"use client";

import React from "react";
import { formatVnd } from "@/lib/costUtils";

interface CostResultCardProps {
  label: string;
  value: string | number;
  format?: "vnd" | "text" | "number";
  highlight?: boolean;
  colorClass?: string;
  bgClass?: string;
}

const CostResultCard: React.FC<CostResultCardProps> = ({
  label,
  value,
  format = "text",
  highlight = false,
  colorClass,
  bgClass = "bg-slate-50 border-slate-200",
}) => {
  let displayValue = String(value);

  if (format === "vnd" && typeof value === "number") {
    displayValue = formatVnd(value);
  }

  return (
    <div
      className={`rounded-xl border p-3.5 flex flex-col items-start justify-between ${bgClass} ${
        highlight ? "ring-2 ring-blue-400" : ""
      }`}
    >
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-tight">
        {label}
      </span>
      <span
        className={`text-lg font-bold mt-2 leading-none ${
          colorClass || "text-slate-900"
        }`}
      >
        {displayValue}
      </span>
    </div>
  );
};

export default CostResultCard;
