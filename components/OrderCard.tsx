import React from "react";
import { OrderStop } from "@/lib/types";

interface Props {
  order: OrderStop;
  index: number;
  onEdit: (order: OrderStop) => void;
  onDelete: (id: string) => void;
  isDeliveryMode?: boolean;
}

export const OrderCard = ({ order, index, onEdit, onDelete, isDeliveryMode = false }: Props) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    delivered: "bg-green-100 text-green-800",
    skipped: "bg-gray-100 text-gray-800",
  };

  const statusLabels = {
    pending: "Chưa giao",
    delivered: "Đã giao",
    skipped: "Bỏ qua",
  };

  return (
    <div className={`bg-white rounded-3xl p-5 shadow-sm border ${isDeliveryMode ? 'border-orange-200 shadow-orange-100' : 'border-slate-200'} flex flex-col gap-3 relative overflow-hidden`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 bg-slate-100 text-slate-700 font-bold rounded-full flex items-center justify-center text-sm">
            {index + 1}
          </span>
          <h3 className="font-bold text-lg text-slate-900 leading-tight">
            {order.receiverName || order.label}
          </h3>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-bold tracking-wide ${statusColors[order.status]}`}>
          {statusLabels[order.status]}
        </span>
      </div>

      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-1">
        <p className="text-lg font-bold text-slate-900 leading-snug">
          {order.address}
        </p>
      </div>

      {(order.phone || order.note) && (
        <div className="flex flex-col gap-2 mt-1">
          {order.phone && (
            <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {order.phone}
            </p>
          )}
          {order.note && (
            <p className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded-lg flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {order.note}
            </p>
          )}
        </div>
      )}

      {order.codAmount ? (
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-bold text-slate-500">Thu hộ (COD)</span>
          <span className="text-xl font-black text-emerald-600">{order.codAmount.toLocaleString("vi-VN")} đ</span>
        </div>
      ) : null}

      {!isDeliveryMode && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
          <button 
            onClick={() => onEdit(order)}
            className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Sửa
          </button>
          <button 
            onClick={() => onDelete(order.id)}
            className="flex-1 bg-red-50 text-red-600 font-bold py-2 rounded-xl hover:bg-red-100 transition-colors"
          >
            Xóa
          </button>
        </div>
      )}
    </div>
  );
};
