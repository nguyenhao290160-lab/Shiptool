"use client";

import React, { useMemo } from "react";
import { generateSmartSuggestions } from "@/lib/smartSuggestions";
import { SmartSuggestionCard } from "./SmartSuggestionCard";

export const SmartSuggestionsPanel: React.FC<{ maxItems?: number }> = ({ maxItems = 5 }) => {
  const suggestions = useMemo(() => generateSmartSuggestions().slice(0, maxItems), [maxItems]);

  if (suggestions.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">Gợi ý thông minh</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestions.map((s) => (
          <SmartSuggestionCard key={s.id} suggestion={s} />
        ))}
      </div>
    </div>
  );
};
