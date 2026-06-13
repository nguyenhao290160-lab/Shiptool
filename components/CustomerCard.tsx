"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FrequentCustomer, DeliveryOrder } from "@/lib/types";
import { formatLastOrderTime, getSuccessRate } from "@/lib/customerUtils";

interface CustomerCardProps {
  customer: FrequentCustomer;
  onEdit: (customer: FrequentCustomer) => void;
  onDelete: (customer: FrequentCustomer) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onEdit, onDelete }) => {
  const router = useRouter();
  const hasCoords = customer.lat !== undefined && customer.lng !== undefined;
  const successRate = getSuccessRate(customer);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 truncate">{customer.name}</h3>
          {customer.phone && (
            <p className="text-xs text-slate-600 font-medium">{customer.phone}</p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(customer)}
            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
            title="Sửa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(customer)}
            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
            title="Xóa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Address and Note */}
      <div className="space-y-1.5">
        <p className="text-xs text-slate-600 font-medium flex items-start gap-1.5">
          <span>📍</span>
          <span className="break-words">{customer.address}</span>
        </p>
        {customer.note && (
          <p className="text-xs text-slate-600 flex items-start gap-1.5">
            <span>📝</span>
            <span className="break-words">{customer.note}</span>
          </p>
        )}
      </div>

      {/* Tags */}
      {customer.tags && customer.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {customer.tags.map((tag) => (
            <span key={tag} className="inline-block bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900">{customer.totalOrders}</p>
          <p className="text-[10px] text-slate-600">Tổng đơn</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-emerald-600">{customer.deliveredOrders}</p>
          <p className="text-[10px] text-slate-600">Đã giao</p>
        </div>
        <div className="text-center">
          <p className={`text-sm font-bold ${successRate >= 90 ? "text-emerald-600" : successRate >= 70 ? "text-amber-600" : "text-red-600"}`}>
            {successRate}%
          </p>
          <p className="text-[10px] text-slate-600">Tỷ lệ</p>
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1">
          {hasCoords ? (
            <>
              <span>✓ Có tọa độ</span>
            </>
          ) : (
            <>
              <span>⚠ Chưa tọa độ</span>
            </>
          )}
        </span>
        <span>{formatLastOrderTime(customer.lastOrderAt)}</span>
      </div>

      {/* Action row */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onEdit(customer)}
          className="flex-1 py-2 rounded-lg bg-blue-50 text-blue-600 font-semibold text-sm hover:bg-blue-100 transition-colors"
        >
          Sửa
        </button>
        <button
          onClick={() => {
            // Prefill order in localStorage and navigate to /orders
            try {
              const pref: Partial<DeliveryOrder> = {
                customerName: customer.name,
                phone: customer.phone || "",
                address: customer.address,
                note: customer.note || "",
                lat: customer.lat,
                lng: customer.lng,
                geocodedAddress: customer.geocodedAddress,
                placeId: customer.placeId,
                status: "pending",
                priority: "normal",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              localStorage.setItem("shiproute_prefill_order", JSON.stringify(pref));
            } catch (err) {
              console.error("Cannot save prefill", err);
            }
            // navigate
            router.push("/orders");
          }}
          className="flex-1 py-2 rounded-lg bg-cyan-600 text-white font-semibold text-sm hover:bg-cyan-700 transition-colors"
        >
          Tạo đơn từ khách này
        </button>
      </div>
    </div>
  );
};
