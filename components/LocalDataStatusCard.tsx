"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  exportBackupJSON,
  exportOrdersCSV,
  validateBackupData,
  replaceLocalData,
  mergeLocalData,
  clearAllLocalData,
  getFullDataStats,
  calculateLocalStorageSize,
  formatStorageSize,
  hasSafetyBackup,
  restoreSafetyBackup,
} from "@/lib/backupUtils";

interface LocalDataStatusCardProps {
  ordersCount?: number;
  routesCount?: number;
  storageSize?: number;
  storageKeys?: string[];
  onRefresh?: () => void;
}

export function LocalDataStatusCard({ onRefresh }: LocalDataStatusCardProps) {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    orderCount: 0,
    routesCount: 0,
    historyCount: 0,
    customerCount: 0,
    lastBackupTime: null as string | null,
  });
  const [storageSize, setStorageSize] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedBackup, setSelectedBackup] = useState<any | null>(null);
  const [fileName, setFileName] = useState("");
  const [showSafetyRestore, setShowSafetyRestore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load stats on client mount
  const loadStats = () => {
    setStats(getFullDataStats());
    setStorageSize(calculateLocalStorageSize());
    setShowSafetyRestore(hasSafetyBackup());
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      loadStats();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <div className="text-center py-6 text-slate-500 font-medium">Đang tải cấu hình dữ liệu...</div>;
  }

  const handleExportJSON = () => {
    try {
      exportBackupJSON();
      setImportSuccess("Đã xuất file sao lưu JSON thành công.");
      loadStats();
      setTimeout(() => setImportSuccess(null), 4000);
    } catch {
      setImportError("Xuất file sao lưu thất bại.");
    }
  };

  const handleExportCSV = () => {
    try {
      exportOrdersCSV();
      setImportSuccess("Đã xuất danh sách đơn hàng sang file CSV thành công.");
      setTimeout(() => setImportSuccess(null), 4000);
    } catch {
      setImportError("Xuất CSV thất bại.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    setSelectedBackup(null);

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const validation = validateBackupData(parsed);
      if (!validation.valid) {
        setImportError(validation.message || "Tệp sao lưu không đúng định dạng.");
        return;
      }

      setSelectedBackup(parsed);
      setFileName(file.name);
    } catch {
      setImportError("Lỗi khi đọc file. Hãy chọn một file JSON sao lưu hợp lệ.");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleMerge = () => {
    if (!selectedBackup) return;
    const result = mergeLocalData(selectedBackup);
    if (result.success) {
      setImportSuccess(result.message);
      setSelectedBackup(null);
      loadStats();
      onRefresh?.();
      setTimeout(() => {
        setImportSuccess(null);
        window.location.reload();
      }, 1500);
    } else {
      setImportError(result.message);
    }
  };

  const handleReplace = () => {
    if (!selectedBackup) return;
    const confirmMsg = 
      "⚠️ CẢNH BÁO QUAN TRỌNG:\n" +
      "Hành động này sẽ XÓA TOÀN BỘ dữ liệu hiện tại (đơn hàng, lịch sử, khách hàng) trước khi ghi đè dữ liệu mới vào.\n\n" +
      "Hãy chắc chắn rằng bạn muốn thay thế. Bạn có đồng ý ghi đè?";
    
    if (!window.confirm(confirmMsg)) return;

    const result = replaceLocalData(selectedBackup);
    if (result.success) {
      setImportSuccess(result.message);
      setSelectedBackup(null);
      loadStats();
      onRefresh?.();
      setTimeout(() => {
        setImportSuccess(null);
        window.location.reload();
      }, 1500);
    } else {
      setImportError(result.message);
    }
  };

  const handleRestoreSafety = () => {
    if (!window.confirm("Khôi phục lại phiên bản dữ liệu trước khi thực hiện thao tác import gần nhất?")) return;
    const result = restoreSafetyBackup();
    if (result.success) {
      setImportSuccess("Đã phục hồi dữ liệu an toàn thành công.");
      loadStats();
      onRefresh?.();
      setTimeout(() => {
        setImportSuccess(null);
        window.location.reload();
      }, 1500);
    } else {
      setImportError(result.message);
    }
  };

  const handleClear = () => {
    const warning = 
      "⚠️ CẢNH BÁO XÓA DỮ LIỆU:\n" +
      "Bạn sắp xóa TẤT CẢ các dữ liệu cục bộ của ShipRoute AI trên trình duyệt này bao gồm:\n" +
      "- Danh sách đơn hàng hiện có\n" +
      "- Tuyến đường active và lịch sử tuyến đường đã đi\n" +
      "- Danh sách khách hàng thường xuyên\n" +
      "- Cấu hình chi phí xăng xe\n\n" +
      "Lưu ý: API Key Google Maps trong cấu hình dự án (.env.local) sẽ KHÔNG bị ảnh hưởng.\n\n" +
      "Bạn có chắc chắn muốn ĐẶT LẠI ứng dụng về trạng thái trống?";

    if (!window.confirm(warning)) return;
    if (!window.confirm("Xác nhận lần cuối: Dữ liệu bị xóa không thể phục hồi trừ khi bạn đã xuất file backup. Bạn thực sự muốn xóa?")) return;

    const result = clearAllLocalData();
    if (result.success) {
      setImportSuccess(result.message);
      loadStats();
      onRefresh?.();
      setTimeout(() => {
        setImportSuccess(null);
        window.location.reload();
      }, 2000);
    } else {
      setImportError(result.message);
    }
  };

  return (
    <div className="space-y-4 text-slate-800">
      {/* ── Summary statistics grid ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/30 rounded-xl p-4 border border-cyan-200/60 shadow-sm">
          <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-1">Đơn giao</p>
          <p className="font-black text-2xl text-cyan-700">{stats.orderCount}</p>
          <p className="text-[10px] text-slate-500">đơn trên thiết bị</p>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-violet-100/30 rounded-xl p-4 border border-violet-200/60 shadow-sm">
          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-1">Tuyến / Lịch sử</p>
          <p className="font-black text-xl text-violet-700">
            {stats.routesCount} <span className="text-sm font-medium text-slate-500">active</span> / {stats.historyCount} <span className="text-sm font-medium text-slate-500">lịch sử</span>
          </p>
          <p className="text-[10px] text-slate-500">tuyến đường đã lưu</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/30 rounded-xl p-4 border border-indigo-200/60 shadow-sm">
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Khách hàng</p>
          <p className="font-black text-2xl text-indigo-700">{stats.customerCount}</p>
          <p className="text-[10px] text-slate-500">khách hàng quen thuộc</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-xl p-4 border border-amber-200/60 shadow-sm">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Dung lượng bộ nhớ</p>
          <p className="font-black text-xl text-amber-700">{formatStorageSize(storageSize)}</p>
          <p className="text-[10px] text-slate-500">sử dụng cục bộ</p>
        </div>
      </div>

      {/* Last backup timestamp */}
      <div className="text-xs text-slate-500 font-medium px-1 flex justify-between items-center bg-slate-100/60 py-2 rounded-lg px-2 border border-slate-200/50">
        <span>Lần sao lưu cuối:</span>
        <span className="font-semibold text-slate-700">
          {stats.lastBackupTime ? new Date(stats.lastBackupTime).toLocaleString("vi-VN") : "Chưa sao lưu"}
        </span>
      </div>

      {/* ── File selection box if a file was selected ── */}
      {selectedBackup && (
        <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 space-y-3 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <span className="text-2xl mt-0.5">📂</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Phát hiện tệp tin sao lưu</p>
              <p className="text-sm font-bold text-slate-900 truncate">{fileName}</p>
              <div className="text-xs text-slate-600 mt-2 space-y-1 bg-white/60 p-2.5 rounded-xl border border-amber-200/50">
                <p>• Phiên bản dữ liệu: <span className="font-bold">{selectedBackup.version || "1.0"}</span></p>
                <p>• Ngày xuất bản: <span className="font-bold">{new Date(selectedBackup.exportedAt || "").toLocaleString("vi-VN")}</span></p>
                <p>• Số đơn hàng: <span className="font-bold text-cyan-600">{selectedBackup.data?.orders?.length || selectedBackup.orders?.length || 0} đơn</span></p>
                <p>• Tuyến đường: <span className="font-bold text-violet-600">{selectedBackup.data?.routes?.length || 0} active / {selectedBackup.data?.routeHistory?.length || selectedBackup.routeHistory?.length || 0} lịch sử</span></p>
                <p>• Khách hàng quen: <span className="font-bold text-indigo-600">{selectedBackup.data?.customers?.length || selectedBackup.customers?.length || 0} khách</span></p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-1.5">
            <button
              onClick={handleMerge}
              className="flex-grow bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-colors shadow-sm shadow-cyan-600/10"
            >
              Gộp dữ liệu
            </button>
            <button
              onClick={handleReplace}
              className="flex-grow bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-colors shadow-sm shadow-rose-600/10"
            >
              Thay thế hoàn toàn
            </button>
            <button
              onClick={() => setSelectedBackup(null)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-2.5 px-3 rounded-xl transition-colors"
            >
              Hủy
            </button>
          </div>
          <p className="text-[10px] text-amber-700 leading-normal bg-amber-100/50 p-2 rounded-lg">
            💡 <strong>Gộp dữ liệu:</strong> Thêm các đơn hàng và khách hàng mới mà không làm mất dữ liệu hiện tại của bạn.<br />
            💡 <strong>Thay thế:</strong> Xóa sạch toàn bộ dữ liệu hiện tại trước khi phục hồi.
          </p>
        </div>
      )}

      {/* ── Action buttons block ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          onClick={handleExportJSON}
          className="bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Xuất dữ liệu sao lưu
        </button>

        <button
          onClick={handleExportCSV}
          className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Xuất đơn hàng (CSV)
        </button>

        <button
          onClick={triggerFileInput}
          className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Nhập dữ liệu từ file
        </button>

        <button
          onClick={handleClear}
          className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Xóa dữ liệu cục bộ
        </button>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
      </div>

      {/* Safety backup restore action (if active session backup exists) */}
      {showSafetyRestore && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center justify-between gap-3 animate-pulse">
          <div className="text-xs text-orange-800">
            <p className="font-bold">⚠️ Có bản phục hồi tạm thời</p>
            <p className="text-[10px]">Hệ thống đã tự động lưu lại dữ liệu của bạn trước khi ghi đè.</p>
          </div>
          <button
            onClick={handleRestoreSafety}
            className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg transition-colors shadow-sm shadow-orange-600/10"
          >
            Khôi phục lại
          </button>
        </div>
      )}

      {/* ── Info Box ── */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs text-sky-900 leading-relaxed space-y-2">
        <h4 className="font-bold flex items-center gap-1.5">
          <span>💡</span> Thông tin lưu trữ và sao lưu
        </h4>
        <ul className="list-disc pl-4 space-y-1">
          <li>Toàn bộ thông tin được lưu trữ cục bộ trên trình duyệt này của bạn. Không có máy chủ bên thứ ba nào thu thập.</li>
          <li>Khi bạn thực hiện <strong>Xóa dữ liệu duyệt web</strong> (clear cache, cookies) hoặc đổi thiết bị, dữ liệu sẽ bị mất vĩnh viễn.</li>
          <li>Hãy tải file sao lưu JSON về máy tính và lưu trữ an toàn trước khi dọn dẹp hệ thống.</li>
        </ul>
      </div>

      {/* Feedback Messages */}
      {importSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 font-semibold flex items-start gap-2 animate-slide-up">
          <span>✓</span> {importSuccess}
        </div>
      )}
      {importError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-800 font-semibold flex items-start gap-2">
          <span>⚠️</span> {importError}
        </div>
      )}
    </div>
  );
}
