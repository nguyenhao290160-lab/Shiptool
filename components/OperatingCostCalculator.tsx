"use client";

import React, { useState, useEffect } from "react";
import {
  OperatingCostSettings,
  RouteCostEstimate,
  calculateOperatingCost,
  DEFAULT_COST_SETTINGS,
} from "@/lib/costUtils";
import { getCostSettings, saveCostSettings, resetCostSettings } from "@/lib/costStorage";
import { RouteCostSummary } from "./RouteCostSummary";
import { AlertBox } from "./AlertBox";

interface OperatingCostCalculatorProps {
  totalDistanceKm?: number;
  totalOrders?: number;
  onCostChange?: (estimate: RouteCostEstimate) => void;
}

export const OperatingCostCalculator: React.FC<OperatingCostCalculatorProps> = ({
  totalDistanceKm: propDistance,
  totalOrders: propOrders = 0,
  onCostChange,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings form state
  const [settings, setSettings] = useState<OperatingCostSettings>(DEFAULT_COST_SETTINGS);

  // Input form state
  const [manualDistance, setManualDistance] = useState<string>("");
  const [useManualDistance, setUseManualDistance] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = getCostSettings();
      setSettings(saved);
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Calculate estimate (memoized)
  const estimate = React.useMemo(() => {
    const distance = useManualDistance
      ? parseFloat(manualDistance) || 0
      : propDistance || 0;
    const orders = propOrders || 0;

    if (distance > 0 && orders > 0) {
      return calculateOperatingCost(distance, orders, settings);
    }
    return null;
  }, [useManualDistance, manualDistance, propDistance, propOrders, settings]);

  // Trigger callback when estimate changes
  useEffect(() => {
    if (estimate) {
      onCostChange?.(estimate);
    }
  }, [estimate, onCostChange]);

  const handleSaveSettings = () => {
    saveCostSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetSettings = () => {
    if (window.confirm("Bạn chắc chắn muốn đặt lại cài đặt về mặc định?")) {
      resetCostSettings();
      setSettings(DEFAULT_COST_SETTINGS);
    }
  };

  if (!isMounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-slate-200 rounded" />
        <div className="h-20 bg-slate-200 rounded" />
      </div>
    );
  }

  const hasData = propDistance && propOrders;

  return (
    <div className="space-y-4">
      {/* ── Settings Toggle Button ── */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm"
        >
          {showSettings ? "Ẩn" : "Cài đặt"} chi phí
        </button>
      </div>

      {/* ── Settings Panel ── */}
      {showSettings && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Cài đặt chi phí vận hành</h3>

          {/* ── Fuel Price ── */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Giá xăng (VND/lít) *
            </label>
            <input
              type="number"
              value={settings.fuelPricePerLiter}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  fuelPricePerLiter: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="25000"
              min="0"
              step="1000"
            />
          </div>

          {/* ── Fuel Consumption ── */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tiêu hao xăng (L/100km) *
            </label>
            <input
              type="number"
              value={settings.fuelConsumptionPer100Km}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  fuelConsumptionPer100Km: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="2.2"
              min="0"
              step="0.1"
            />
            <p className="text-xs text-slate-500 mt-1">Xe máy: 2.0-2.5, Ôtô: 7-8</p>
          </div>

          {/* ── Maintenance Cost ── */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Chi phí bảo trì (VND/km)
            </label>
            <input
              type="number"
              value={settings.maintenanceCostPerKm || 0}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maintenanceCostPerKm: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="300"
              min="0"
              step="50"
            />
          </div>

          {/* ── Other Cost ── */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Chi phí khác mỗi tuyến (VND)
            </label>
            <input
              type="number"
              value={settings.otherCostPerRoute || 0}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  otherCostPerRoute: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              step="5000"
            />
          </div>

          {/* ── Default Shipping Fee ── */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phí ship mặc định mỗi đơn (VND)
            </label>
            <input
              type="number"
              value={settings.defaultShippingFeePerOrder || 0}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  defaultShippingFeePerOrder: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              step="5000"
            />
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSaveSettings}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Lưu cài đặt
            </button>
            <button
              onClick={handleResetSettings}
              className="flex-1 bg-slate-400 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Đặt lại
            </button>
          </div>

          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-xs font-medium text-green-700">✓ Cài đặt đã được lưu</p>
            </div>
          )}
        </div>
      )}

      {/* ── Distance Input ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Nhập dữ liệu tuyến</h3>

        {propDistance && !useManualDistance && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <p className="text-xs text-blue-700">
              ℹ️ Sử dụng quãng đường từ tuyến hiện tại: <span className="font-bold">{propDistance.toFixed(1)} km</span>
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useManualDistance"
            checked={useManualDistance}
            onChange={(e) => {
              setUseManualDistance(e.target.checked);
              setManualDistance("");
            }}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded cursor-pointer"
          />
          <label htmlFor="useManualDistance" className="text-xs font-medium text-slate-700 cursor-pointer">
            Nhập thủ công quãng đường
          </label>
        </div>

        {useManualDistance && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tổng quãng đường (km)
            </label>
            <input
              type="number"
              value={manualDistance}
              onChange={(e) => setManualDistance(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>
        )}
      </div>

      {/* ── Cost Summary ── */}
      {hasData || (useManualDistance && manualDistance) ? (
        estimate ? (
          <RouteCostSummary estimate={estimate} />
        ) : (
          <AlertBox type="warning" title="Thiếu dữ liệu" message="Nhập quãng đường và số đơn để tính chi phí" />
        )
      ) : (
        <AlertBox type="info" title="Chưa có tuyến" message="Hãy tạo hoặc chọn một tuyến để tính chi phí." />
      )}
    </div>
  );
};
