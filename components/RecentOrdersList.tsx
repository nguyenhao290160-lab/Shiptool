"use client";

import React from "react";
import { DeliveryOrder } from "@/lib/types";
import {
  truncateAddress,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  getPriorityLabel,
} from "@/lib/dashboardStats";

interface RecentOrdersListProps {
  orders: DeliveryOrder[];
  title: string;
}

export function RecentOrdersList({ orders, title }: RecentOrdersListProps) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
      <h3 className="font-bold text-lg text-slate-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {orders.map((order) => (
          <div
            key={order.id}
            className={`${getStatusBgColor(
              order.status
            )} rounded-2xl p-3 border border-slate-200 hover:border-slate-300 transition-colors`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 text-sm truncate">
                  {order.customerName}
                </h4>
                <p className="text-xs text-slate-600 truncate mt-1">
                  {truncateAddress(order.address, 40)}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg bg-white border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-lg bg-white text-slate-600 border border-slate-200">
                    {getPriorityLabel(order.priority)}
                  </span>
                  {order.lat && order.lng ? (
                    <span className="text-xs font-medium px-2 py-1 rounded-lg bg-white text-green-600 border border-green-200">
                      📍 Có tọa độ
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-1 rounded-lg bg-white text-orange-600 border border-orange-200">
                      ⚠️ Chưa có tọa độ
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
