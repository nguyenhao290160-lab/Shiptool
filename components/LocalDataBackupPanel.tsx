"use client";

import React, { useState } from "react";
import {
  exportBackupJSON,
  exportOrdersCSV,
  importBackupJSON,
  clearAllLocalData,
  getDataStats,
  formatStorageSize,
  calculateLocalStorageSize,
  ShipRouteBackupData,
  validateBackupData,
} from "@/lib/backupUtils";
import { seedDemoOrdersIfEmpty } from "@/lib/deliveryStorage";

interface Props {
  onDataImported?: () => void;
}

export const LocalDataBackupPanel = ({ onDataImported }: Props) => {
  const [, setRefresh] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const stats = getDataStats();
  const storageSize = calculateLocalStorageSize();

  const handleExportJSON = () => {
    exportBackupJSON();
    setImportSuccess("Đã xuất backup JSON thành công");
    setTimeout(() => setImportSuccess(null), 3000);
  };

  const handleExportCSV = () => {
    exportOrdersCSV();
    setImportSuccess("Đã xuất danh sách CSV thành công");
    setTimeout(() => setImportSuccess(null), 3000);
  };

  const handleImportJSON = () => {
    setImportError(null);
    setImportSuccess(null);

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      try {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const text = await file.text();
        const data = JSON.parse(text) as ShipRouteBackupData;

        const validation = validateBackupData(data);
        if (!validation.valid) {
          setImportError(validation.message || "File không hợp lệ");
          return;
        }

        if (
          !window.confirm(
            "Bạn có chắc muốn nhập backup này? Dữ liệu hiện tại có thể bị ghi đè.\n\n" +
              `File chứa: ${data.metadata?.totalOrders || 0} đơn, ${data.metadata?.totalRoutePoints || 0} điểm tuyến`
          )
        ) {
          return;
        }

        const result = importBackupJSON(data);
        if (result.success) {
          setImportSuccess(result.message);
          setRefresh(prev => prev + 1);
          onDataImported?.();
          setTimeout(() => setImportSuccess(null), 5000);
        } else {
          setImportError(result.message);
        }
      } catch (err) {
        setImportError(
          `Lỗi khi đọc file: ${err instanceof Error ? err.message : "unknown"}`
        );
      }
    };

    input.click();
  };

  const handleResetDemo = () => {
    if (
      !window.confirm(
        "Bạn có chắc muốn tạo lại dữ liệu demo? Dữ liệu hiện tại sẽ được giữ lại, dữ liệu demo sẽ được thêm vào."
      )
    ) {
      return;
    }

    try {
      seedDemoOrdersIfEmpty();
      setRefresh(prev => prev + 1);
      setImportSuccess("Đã tạo lại dữ liệu demo thành công");
      onDataImported?.();
      setTimeout(() => setImportSuccess(null), 3000);
    } catch (err) {
      setImportError(
        `Lỗi: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  };

  const handleClearAllData = () => {
    if (
      !window.confirm(
        "⚠️ CẢNH BÁO: Bạn sắp xóa TẤT CẢ dữ liệu local của ShipRoute AI!\n\n" +
          "Thao tác này KHÔNG THỂ HOÀN TÁC. Hãy xuất backup trước khi tiếp tục.\n\n" +
          "Bạn có chắc không?"
      )
    ) {
      return;
    }

    // Second confirmation for destructive action
    if (!window.confirm("Lần cuối cùng: Bạn thực sự muốn xóa tất cả dữ liệu?")) {
      return;
    }

    const result = clearAllLocalData();
    if (result.success) {
      setImportSuccess(result.message);
      setRefresh(prev => prev + 1);
      onDataImported?.();
      setTimeout(() => {
        setImportSuccess(null);
        window.location.reload();
      }, 2000);
    } else {
      setImportError(result.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-cyan-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Dữ liệu local / Backup
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Dữ liệu của bạn đang được lưu cục bộ trên trình duyệt này. Hãy xuất
          backup định kỳ để tránh mất dữ liệu khi xóa cache hoặc đổi thiết bị.
        </p>
      </div>

      {/* ── Data Stats ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-cyan-50 rounded-xl border border-cyan-100 p-3">
          <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-1">
            Số đơn đang lưu
          </p>
          <p className="text-lg font-bold text-cyan-900">{stats.orderCount}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-3">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
            Điểm trong tuyến
          </p>
          <p className="text-lg font-bold text-emerald-900">{stats.routePointCount}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-3 col-span-2">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
            Dung lượng dữ liệu
          </p>
          <p className="text-lg font-bold text-amber-900">
            {formatStorageSize(storageSize)}
          </p>
        </div>
      </div>

      {/* ── Export/Import Buttons ── */}
      <div className="space-y-2">
        <button
          onClick={handleExportJSON}
          className="w-full bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-6-4m6 4l6-4"
            />
          </svg>
          Xuất backup JSON
        </button>

        <button
          onClick={handleExportCSV}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2m0 0v-8m0 8l-6-4m6 4l6-4"
            />
          </svg>
          Xuất danh sách CSV
        </button>

        <button
          onClick={handleImportJSON}
          className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nhập backup JSON
        </button>
      </div>

      {/* ── Manage Data ── */}
      <div className="space-y-2 border-t border-slate-200 pt-3">
        <button
          onClick={handleResetDemo}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Tạo lại dữ liệu demo
        </button>

        <button
          onClick={handleClearAllData}
          className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Xóa toàn bộ dữ liệu local
        </button>
      </div>

      {/* ── Success Message ── */}
      {importSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-2 animate-slide-up">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs font-medium text-emerald-800">{importSuccess}</p>
        </div>
      )}

      {/* ── Error Message ── */}
      {importError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-red-600 mt-0.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs font-medium text-red-800">{importError}</p>
        </div>
      )}
    </div>
  );
};
