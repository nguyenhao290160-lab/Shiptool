"use client";

import React from "react";
import { FrequentCustomer } from "@/lib/types";
import { getFrequentCustomers } from "@/lib/customerStorage";
import { filterCustomers } from "@/lib/customerUtils";

interface Props {
  query: string;
  visible?: boolean;
  onSelect: (c: FrequentCustomer) => void;
  maxItems?: number;
}

export const CustomerSuggestions: React.FC<Props> = ({ query, visible = true, onSelect, maxItems = 6 }) => {
  const suggestions = React.useMemo(() => {
    if (!visible || !query.trim()) return [] as FrequentCustomer[];
    const all = getFrequentCustomers();
    return filterCustomers(all, query).slice(0, maxItems);
  }, [query, visible, maxItems]);

  if (!visible || !query.trim()) return null;

  return (
    <div className="absolute left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden max-h-60 overflow-y-auto">
      {suggestions.length === 0 ? (
        <div className="p-3 text-xs text-slate-500">Không tìm thấy khách hàng</div>
      ) : (
        suggestions.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className="w-full text-left p-3 hover:bg-slate-50 flex items-start gap-3"
            title={`${c.name} • ${c.phone || ''}`}
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{c.name}</div>
              <div className="text-xs text-slate-500 truncate">{c.phone || '—'} · {c.address}</div>
            </div>
            <div className="text-[11px] text-slate-500">{c.totalOrders} đơn</div>
          </button>
        ))
      )}
    </div>
  );
};
