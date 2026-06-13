"use client";

import React from "react";
import { SmartSuggestion } from "@/lib/smartSuggestions";
import { useRouter } from "next/navigation";
import { exportBackupJSON } from "@/lib/backupUtils";

interface Props {
  suggestion: SmartSuggestion;
}

export const SmartSuggestionCard: React.FC<Props> = ({ suggestion }) => {
  const router = useRouter();

  const severityClass = {
    info: "bg-sky-50 border-sky-200 text-sky-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
    danger: "bg-red-50 border-red-200 text-red-700",
  }[suggestion.severity || "info"];

  const handleAction = () => {
    if (suggestion.actionHref) {
      router.push(suggestion.actionHref);
      return;
    }
    if (suggestion.actionLabel === "Xuất backup JSON") {
      try {
        exportBackupJSON();
      } catch (err) {
        console.error("Export backup failed", err);
      }
      return;
    }
  };

  return (
    <div className={`rounded-xl border p-3 ${severityClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900 truncate">{suggestion.title}</div>
          <div className="text-xs text-slate-700 mt-1 break-words">{suggestion.message}</div>
        </div>
        <div className="flex-shrink-0">
          {suggestion.actionLabel && (
            <button
              onClick={handleAction}
              className="text-xs font-semibold bg-white/80 px-3 py-1 rounded-lg shadow-sm"
            >
              {suggestion.actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
