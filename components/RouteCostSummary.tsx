"use client";

import React from "react";
import {
  RouteCostEstimate,
  formatVnd,
  formatDistanceKm,
  formatLiters,
  isLoss,
  getProfitMargin,
  getProfitCardBgClass,
  getProfitColorClass,
} from "@/lib/costUtils";
import CostResultCard from "./CostResultCard";

interface RouteCostSummaryProps {
  estimate: RouteCostEstimate;
  showWarning?: boolean;
}

export const RouteCostSummary: React.FC<RouteCostSummaryProps> = ({
  estimate,
  showWarning = true,
}) => {
  const loss = isLoss(estimate);
  const margin = getProfitMargin(estimate);
  const profitColorClass = getProfitColorClass(estimate);
  const profitCardBgClass = getProfitCardBgClass(estimate);

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Chi phí vận hành</h3>

        {/* ── Distance & Orders ── */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-xs">
            <span className="text-slate-600 font-medium">Quãng đường:</span>
            <p className="text-slate-900 font-bold">{formatDistanceKm(estimate.totalDistanceKm)}</p>
          </div>
          <div className="text-xs">
            <span className="text-slate-600 font-medium">Số đơn:</span>
            <p className="text-slate-900 font-bold">{estimate.totalOrders}</p>
          </div>
        </div>

        {/* ── Fuel Consumption ── */}
        <div className="text-xs bg-slate-50 rounded-lg p-2">
          <span className="text-slate-600 font-medium">Xăng ước tính:</span>
          <p className="text-slate-900 font-bold">{formatLiters(estimate.fuelLiters)}</p>
        </div>
      </div>

      {/* ── Cost Breakdown Grid ── */}
      <div className="grid grid-cols-2 gap-2">
        <CostResultCard
          label="Chi phí xăng"
          value={estimate.fuelCost}
          format="vnd"
          bgClass="bg-orange-50 border-orange-200"
        />
        <CostResultCard
          label="Chi phí bảo trì"
          value={estimate.maintenanceCost}
          format="vnd"
          bgClass="bg-blue-50 border-blue-200"
        />
        <CostResultCard
          label="Chi phí khác"
          value={estimate.otherCost}
          format="vnd"
          bgClass="bg-slate-50 border-slate-200"
        />
        <CostResultCard
          label="Tổng chi phí"
          value={estimate.totalOperatingCost}
          format="vnd"
          highlight
          bgClass="bg-purple-50 border-purple-300"
        />
      </div>

      {/* ── Revenue & Profit ── */}
      <div className="grid grid-cols-2 gap-2">
        <CostResultCard
          label="Doanh thu ước tính"
          value={estimate.estimatedRevenue}
          format="vnd"
          bgClass="bg-teal-50 border-teal-200"
        />
        <CostResultCard
          label={loss ? "Lỗ ước tính" : "Lợi nhuận ước tính"}
          value={estimate.estimatedProfit}
          format="vnd"
          colorClass={profitColorClass}
          bgClass={profitCardBgClass}
          highlight={loss}
        />
      </div>

      {/* ── Per-Order Metrics ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-tight">
          Trung bình mỗi đơn
        </h4>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-xs font-medium text-slate-600">Chi phí:</span>
            <span className="text-sm font-bold text-slate-900">{formatVnd(estimate.costPerOrder)}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-xs font-medium text-slate-600">Doanh thu:</span>
            <span className="text-sm font-bold text-slate-900">{formatVnd(estimate.revenuePerOrder)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-600">Lợi nhuận:</span>
            <span className={`text-sm font-bold ${profitColorClass}`}>
              {formatVnd(estimate.profitPerOrder)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Profit Margin ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">Tỷ suất lợi nhuận</span>
          <span className={`text-lg font-bold ${profitColorClass}`}>
            {margin.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* ── Warning ── */}
      {showWarning && loss && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs font-medium text-red-700">
            ⚠️ Cảnh báo: Lợi nhuận âm. Chi phí vận hành cao hơn doanh thu ước tính.
          </p>
        </div>
      )}

      {/* ── Info ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          💡 Chi phí chỉ là ước tính. Kết quả thực tế có thể thay đổi theo giá xăng, tình trạng xe, kẹt xe và cách chạy.
        </p>
      </div>
    </div>
  );
};
