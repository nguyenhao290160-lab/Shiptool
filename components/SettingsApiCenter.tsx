"use client";

import React, { useEffect, useState } from "react";
import {
  maskApiKey,
  isApiKeyConfigured,
  getLocalStorageSize,
  getDeliveryOrdersCount,
  getRoutePlansCount,
  getShipRouteStorageKeys,
  isServiceWorkerSupported,
  isServiceWorkerRegistered,
  hasBackupData,
  isLocalStorageAvailable,
} from "@/lib/settingsUtils";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { SystemStatusCard } from "./SystemStatusCard";
import { LocalDataStatusCard } from "./LocalDataStatusCard";
import { SystemHealthCheck } from "./SystemHealthCheck";
import { SettingsShortcutGrid } from "./SettingsShortcutGrid";
import { loadGoogleMapsScript } from "@/lib/mapUtils";
import { geocodeAddress } from "@/lib/geocoding";
import { mapGoogleMapsError } from "@/lib/googleMapsErrors";

export function SettingsApiCenter() {
  const [isMounted, setIsMounted] = useState(false);
  const [apiKeyMasked, setApiKeyMasked] = useState("");
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const [routesCount, setRoutesCount] = useState(0);
  const [storageSize, setStorageSize] = useState(0);
  const [storageKeys, setStorageKeys] = useState<string[]>([]);
  const [swSupported, setSwSupported] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);
  const [hasBackup, setHasBackup] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(false);
  const isOnline = useOnlineStatus();

  // Diagnostics States
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagResult, setDiagResult] = useState<{
    apiKeyStatus: "ok" | "missing";
    internetStatus: "online" | "offline";
    scriptStatus: "success" | "failed" | "not_tested";
    geocodeStatus: "success" | "failed" | "not_tested";
    detailedError: { title: string; message: string; fix: string } | null;
  } | null>(null);

  const refreshStats = () => {
    setOrdersCount(getDeliveryOrdersCount());
    setRoutesCount(getRoutePlansCount());
    setStorageSize(getLocalStorageSize());
    setStorageKeys(getShipRouteStorageKeys());
  };

  const runDiagnostics = async () => {
    setDiagLoading(true);
    setDiagResult(null);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const isKeySet = isApiKeyConfigured(apiKey);
    const online = navigator.onLine;

    const result: {
      apiKeyStatus: "ok" | "missing";
      internetStatus: "online" | "offline";
      scriptStatus: "success" | "failed" | "not_tested";
      geocodeStatus: "success" | "failed" | "not_tested";
      detailedError: { title: string; message: string; fix: string } | null;
    } = {
      apiKeyStatus: isKeySet ? "ok" : "missing",
      internetStatus: online ? "online" : "offline",
      scriptStatus: "not_tested",
      geocodeStatus: "not_tested",
      detailedError: null,
    };

    if (!isKeySet) {
      result.detailedError = {
        title: "Chưa cấu hình API Key",
        message: "Ứng dụng chưa phát hiện khóa API Google Maps nào được cấu hình trong hệ thống.",
        fix: "Hãy tạo file .env.local ở thư mục gốc của dự án, thiết lập biến NEXT_PUBLIC_GOOGLE_MAPS_API_KEY và khởi động lại npm run dev."
      };
      setDiagResult(result);
      setDiagLoading(false);
      return;
    }

    if (!online) {
      result.detailedError = {
        title: "Thiết bị ngoại tuyến",
        message: "Bạn không có kết nối internet để kiểm tra các dịch vụ của Google.",
        fix: "Vui lòng kết nối wifi hoặc dữ liệu di động và bấm thử lại."
      };
      setDiagResult(result);
      setDiagLoading(false);
      return;
    }

    // 1. Test script load
    try {
      await loadGoogleMapsScript();
      result.scriptStatus = "success";
    } catch (err) {
      result.scriptStatus = "failed";
      result.detailedError = mapGoogleMapsError(err);
      setDiagResult(result);
      setDiagLoading(false);
      return;
    }

    // 2. Test Geocoding API call
    try {
      const res = await geocodeAddress("Hồ Chí Minh", apiKey!);
      if (res && res.lat) {
        result.geocodeStatus = "success";
      } else {
        throw new Error("Không lấy được tọa độ thực tế");
      }
    } catch (err) {
      result.geocodeStatus = "failed";
      result.detailedError = mapGoogleMapsError(err);
    }

    setDiagResult(result);
    setDiagLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      setIsApiKeySet(isApiKeyConfigured(apiKey));
      setApiKeyMasked(maskApiKey(apiKey));
      refreshStats();
      setSwSupported(isServiceWorkerSupported());
      setHasBackup(hasBackupData());
      setStorageAvailable(isLocalStorageAvailable());

      if (isServiceWorkerSupported()) {
        const registered = await isServiceWorkerRegistered();
        setSwRegistered(registered);
      }

      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return <div className="text-center py-6" />;
  }

  return (
    <div className="space-y-6 stagger-children">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 text-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Cài đặt</h1>
          <p className="text-slate-300 font-medium text-sm mt-1">Quản lý API key và cấu hình hệ thống</p>
        </div>
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT COLUMN */}
        <div className="space-y-5">
          {/* API Key Section */}
          <div className="card-premium space-y-4">
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-lg">🔑</span>
              Google Maps API Key
            </h2>

            {/* Status Card */}
            <div
              className={`rounded-xl p-4 border ${
                isApiKeySet
                  ? "bg-emerald-50/80 border-emerald-200/80"
                  : "bg-amber-50/80 border-amber-200/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-slate-800">Trạng thái</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isApiKeySet
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {isApiKeySet ? "✓ Đã cấu hình" : "⚠ Chưa cấu hình"}
                </span>
              </div>
              <p className="text-slate-600 font-mono text-xs bg-white/60 rounded-lg px-3 py-2 border border-slate-200/50">{apiKeyMasked}</p>
            </div>

            {/* Setup Instructions */}
            <div className="bg-sky-50/80 border border-sky-200/80 rounded-xl p-4">
              <h3 className="font-bold text-sm text-sky-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sm">📋</span>
                Hướng dẫn cấu hình
              </h3>
              <div className="space-y-2.5 text-sm text-sky-900">
                <p>
                  <strong>Bước 1:</strong> Tạo file <code className="bg-white/80 px-2 py-0.5 rounded-md font-mono text-xs border border-sky-200/50">.env.local</code> ở thư mục gốc project.
                </p>
                <p>
                  <strong>Bước 2:</strong> Thêm dòng sau vào file:
                </p>
                <div className="code-block-light !bg-white/80 !border-sky-200/50">
                  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
                </div>
                <p>
                  <strong>Bước 3:</strong> Thay <code className="bg-white/80 px-2 py-0.5 rounded-md font-mono text-xs border border-sky-200/50">your_api_key_here</code> bằng API key thật từ Google Cloud.
                </p>
                <p>
                  <strong>Bước 4:</strong> Restart dev server bằng <code className="bg-white/80 px-2 py-0.5 rounded-md font-mono text-xs border border-sky-200/50">npm run dev</code>.
                </p>
                <p className="text-xs text-sky-700 mt-2 bg-white/60 rounded-lg px-3 py-2 border border-sky-200/50">
                  💡 <strong>Lưu ý:</strong> Không commit file <code className="font-mono">.env.local</code> lên GitHub! Khi deploy lên môi trường Production (như Vercel, Netlify), bạn cần thiết lập biến môi trường <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> trực tiếp trong phần cấu hình biến môi trường (Environment Variables) của dịch vụ hosting đó.
                </p>
              </div>
            </div>

            {/* Google Maps Configuration Diagnostics (Added for Prompt 39) */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center text-sm">🔍</span>
                Chẩn đoán Google Maps
              </h3>
              
              <p className="text-xs text-slate-600 font-medium">
                Chạy kiểm thử kết nối và quyền hạn API key để đảm bảo các dịch vụ bản đồ hoạt động đúng.
              </p>

              <button
                onClick={runDiagnostics}
                disabled={diagLoading}
                className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:bg-slate-400 text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                {diagLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang chạy kiểm tra...
                  </>
                ) : (
                  <>
                    <span>Kiểm tra cấu hình Google Maps</span>
                  </>
                )}
              </button>

              {/* Diagnostic Results */}
              {diagResult && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-2 border-t border-slate-200/60 pt-2.5">
                    {/* API Key Check */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">1. Khóa API Key:</span>
                      <span className={`font-bold ${diagResult.apiKeyStatus === "ok" ? "text-emerald-600" : "text-amber-600"}`}>
                        {diagResult.apiKeyStatus === "ok" ? "✓ Đã tìm thấy" : "✗ Chưa có"}
                      </span>
                    </div>

                    {/* Internet Check */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">2. Kết nối Internet:</span>
                      <span className={`font-bold ${diagResult.internetStatus === "online" ? "text-emerald-600" : "text-red-600"}`}>
                        {diagResult.internetStatus === "online" ? "✓ Kết nối tốt" : "✗ Ngoại tuyến"}
                      </span>
                    </div>

                    {/* Script Load Check */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">3. Tải Maps Script:</span>
                      <span className={`font-bold ${
                        diagResult.scriptStatus === "success" 
                          ? "text-emerald-600" 
                          : diagResult.scriptStatus === "failed" 
                          ? "text-red-600" 
                          : "text-slate-400"
                      }`}>
                        {diagResult.scriptStatus === "success" && "✓ Thành công"}
                        {diagResult.scriptStatus === "failed" && "✗ Thất bại"}
                        {diagResult.scriptStatus === "not_tested" && "— Chưa thử"}
                      </span>
                    </div>

                    {/* Geocoding API Check */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">4. Google Geocoding API:</span>
                      <span className={`font-bold ${
                        diagResult.geocodeStatus === "success" 
                          ? "text-emerald-600" 
                          : diagResult.geocodeStatus === "failed" 
                          ? "text-red-600" 
                          : "text-slate-400"
                      }`}>
                        {diagResult.geocodeStatus === "success" && "✓ Hoạt động tốt"}
                        {diagResult.geocodeStatus === "failed" && "✗ Gặp lỗi"}
                        {diagResult.geocodeStatus === "not_tested" && "— Chưa thử"}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Error Box */}
                  {diagResult.detailedError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1.5 text-xs">
                      <p className="font-bold text-red-800 flex items-center gap-1.5">
                        <span className="text-sm">⚠️</span>
                        {diagResult.detailedError.title}
                      </p>
                      <p className="text-red-700 leading-relaxed font-medium">
                        {diagResult.detailedError.message}
                      </p>
                      <div className="border-t border-red-200/50 my-1 pt-1.5">
                        <p className="font-bold text-slate-700 uppercase text-[9px] tracking-wider">Cách khắc phục đề xuất:</p>
                        <p className="text-slate-600 font-medium leading-relaxed mt-0.5">
                          {diagResult.detailedError.fix}
                        </p>
                      </div>
                    </div>
                  )}

                  {!diagResult.detailedError && diagResult.geocodeStatus === "success" && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                      <span>🎉</span>
                      <span>Cấu hình Google Maps hoàn toàn chính xác và sẵn sàng sử dụng!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Security Warning */}
          <div className="rounded-xl p-4 border border-rose-200/80 bg-rose-50/60" style={{ boxShadow: "var(--shadow-sm)" }}>
            <h3 className="font-bold text-sm text-rose-900 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center text-sm">⚠️</span>
              Cảnh báo bảo mật
            </h3>
            <ul className="text-sm text-rose-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">🔒</span>
                <span>Không commit file <code className="bg-white/60 px-1.5 py-0.5 rounded font-mono text-xs">.env.local</code> lên GitHub</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">🚫</span>
                <span>Không dán API key trực tiếp vào code nguồn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">🌍</span>
                <span>Giới hạn API key theo domain/IP trong Google Cloud nếu deploy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">🔐</span>
                <span>Sử dụng HTTP referrers và bật API restrictions để bảo vệ key</span>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
          {/* System Status Section */}
          <div className="card-premium space-y-4">
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-lg">🔌</span>
              Trạng thái hệ thống
            </h2>
            <SystemStatusCard swSupported={swSupported} swRegistered={swRegistered} />
          </div>

          {/* Local Data Section */}
          <div className="card-premium space-y-4">
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-lg">💾</span>
              Dữ liệu & sao lưu
            </h2>
            <LocalDataStatusCard
              ordersCount={ordersCount}
              routesCount={routesCount}
              storageSize={storageSize}
              storageKeys={storageKeys}
              onRefresh={refreshStats}
            />
          </div>

          {/* System Health Check Section */}
          <div className="card-premium space-y-4">
            <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-lg">✓</span>
              Kiểm tra nhanh
            </h2>
            <SystemHealthCheck
              apiKeyConfigured={isApiKeySet}
              isOnline={isOnline || false}
              hasOrders={ordersCount > 0}
              hasRoutes={routesCount > 0}
              hasBackup={hasBackup}
              swSupported={swSupported}
              localStorageAvailable={storageAvailable}
            />
          </div>
        </div>
      </div>

      {/* Full-width sections */}
      {/* Shortcuts Section */}
      <div className="card-premium space-y-4">
        <SettingsShortcutGrid />
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-5 border border-slate-200/80" style={{ boxShadow: "var(--shadow-sm)" }}>
        <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-sm">📝</span>
          Thông tin thêm
        </h3>
        <ul className="text-sm text-slate-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
            <span>Tất cả dữ liệu đơn giao, tuyến đường được lưu cục bộ (localStorage).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
            <span>Khi offline, app vẫn hoạt động bình thường cho dữ liệu local.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">⚠</span>
            <span>Google Maps API, Geocoding, Directions, Distance Matrix cần internet.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-500 mt-0.5">💾</span>
            <span>Có thể backup/export dữ liệu để tránh mất.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-500 mt-0.5">🔄</span>
            <span>PWA giúp cài app nhanh hơn và mở trang nhanh hơn.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
