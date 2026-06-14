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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

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
            {/* API Key Section (Simplified UX) */}
            <div className="card-premium space-y-4">
              <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-lg">🔑</span>
                Google Maps API Key
              </h2>

              {/* Simplified status */}
              <div className="rounded-xl p-4 border bg-white/60">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Trạng thái</div>
                        <div className="text-xs text-slate-600">Thiết lập API key cho Google Maps</div>
                        {isApiKeySet && apiKeyMasked ? (
                          <div className="text-xs text-slate-500 mt-1">Khóa: <span className="font-mono">{apiKeyMasked}</span></div>
                        ) : null}
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${isApiKeySet ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                      {isApiKeySet ? 'Đã cấu hình' : 'Chưa cấu hình'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4-step Setup Card + Copy */}
              <div className="rounded-xl p-4 border bg-slate-50/80 space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sm">📋</span>
                  Hướng dẫn nhanh (4 bước)
                </h3>

                <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700">
                  <li><strong>Tạo / mở</strong> file <code className="font-mono text-xs bg-white px-1 rounded">.env.local</code> ở thư mục gốc (C:\Shiptool).</li>
                  <li><strong>Dán</strong> dòng cấu hình mẫu bên dưới vào file.</li>
                  <li><strong>Thay</strong> your_api_key_here bằng API key thật (không dán vào app).</li>
                  <li><strong>Khởi động lại</strong> dev server: Ctrl + C rồi <code className="font-mono text-xs bg-white px-1 rounded">npm run dev</code>.</li>
                </ol>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="code-block-light overflow-x-auto rounded-md p-2 text-sm font-mono flex items-center justify-between gap-3">
                      <span className="truncate">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">Không lưu key trong trình duyệt. Thêm vào file <code className="font-mono">.env.local</code> trên máy của bạn.</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                            try {
                                  await navigator.clipboard.writeText('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here');
                                  setCopyStatus('success');
                                  setTimeout(() => setCopyStatus('idle'), 2000);
                                } catch {
                                  setCopyStatus('error');
                                  setTimeout(() => setCopyStatus('idle'), 2500);
                                }
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-semibold shadow-sm focus:outline-none"
                    >
                      <span>Sao chép dòng cấu hình</span>
                    </button>

                    <a
                      href="https://developers.google.com/maps/documentation"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Mở hướng dẫn Google Maps
                    </a>
                  </div>
                </div>

                {/* copy status */}
                {copyStatus === 'success' && <div className="text-xs text-emerald-700 font-semibold">Đã sao chép</div>}
                {copyStatus === 'error' && <div className="text-xs text-amber-700 font-semibold">Không thể sao chép. Vui lòng sao chép thủ công.</div>}
              </div>

              {/* Where to put the key */}
              <div className="rounded-xl p-3 border bg-white/60 text-sm">
                <strong>Gắn key ở đâu?</strong>
                <div className="mt-2 text-slate-600">
                  Mở file <code className="font-mono">.env.local</code> ở thư mục gốc <code className="font-mono">C:\Shiptool</code> và dán dòng <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...</code>. Sau khi sửa, tắt dev server (Ctrl + C) rồi chạy lại <code className="font-mono">npm run dev</code>.
                </div>
              </div>

              {/* Diagnostics - simplified rows */}
              <div className="rounded-xl p-4 border bg-slate-50/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm">Kiểm tra cấu hình Google Maps</div>
                  <div className="text-xs text-slate-500">Chạy nhanh các kiểm tra cơ bản</div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    onClick={runDiagnostics}
                    disabled={diagLoading}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm focus:outline-none ${diagLoading ? 'bg-slate-400 text-white cursor-wait' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
                  >
                    {diagLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang kiểm tra...
                      </>
                    ) : (
                      <>Kiểm tra cấu hình</>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAdvanced((s) => !s)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm hover:bg-slate-50"
                  >
                    Xem lỗi thường gặp
                  </button>
                </div>

                {/* Simple status rows (if diagResult exists) */}
                {diagResult && (
                  <div className="space-y-2 pt-2">
                    {/** Row helper */}
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">API Key</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${diagResult.apiKeyStatus === 'ok' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{diagResult.apiKeyStatus === 'ok' ? 'OK' : 'Chưa cấu hình'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Kết nối Internet</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${diagResult.internetStatus === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{diagResult.internetStatus === 'online' ? 'OK' : 'Ngoại tuyến'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Google Maps Script</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${diagResult.scriptStatus === 'success' ? 'bg-emerald-100 text-emerald-800' : diagResult.scriptStatus === 'failed' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'}`}>{diagResult.scriptStatus === 'success' ? 'OK' : diagResult.scriptStatus === 'failed' ? 'Lỗi' : 'Chưa thử'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">Geocoding API</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${diagResult.geocodeStatus === 'success' ? 'bg-emerald-100 text-emerald-800' : diagResult.geocodeStatus === 'failed' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'}`}>{diagResult.geocodeStatus === 'success' ? 'OK' : diagResult.geocodeStatus === 'failed' ? 'Lỗi' : 'Chưa thử'}</span>
                      </div>
                    </div>

                    {/* Short explanation or friendly message */}
                    {diagResult.detailedError ? (
                      <div className="mt-2 rounded-md p-3 bg-rose-50 border border-rose-200 text-sm text-rose-800">
                        <div className="font-semibold">{diagResult.detailedError.title}</div>
                        <div className="mt-1 text-slate-700">{diagResult.detailedError.message}</div>
                        <div className="mt-2 text-slate-600 text-sm">{diagResult.detailedError.fix}</div>
                      </div>
                    ) : diagResult.geocodeStatus === 'success' ? (
                      <div className="mt-2 rounded-md p-3 bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-semibold">🎉 Cấu hình Google Maps hoạt động tốt.</div>
                    ) : null}

                    {/* Advanced collapsible */}
                    {showAdvanced && (
                      <div className="mt-2 p-3 border rounded-md bg-white text-sm text-slate-700">
                        <div className="font-semibold mb-2">Chi tiết nâng cao</div>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>ReferrerNotAllowedMapError — kiểm tra HTTP referrers ở Google Cloud.</li>
                          <li>API not enabled — bật Maps JS, Geocoding, Directions và Distance Matrix trong GCP.</li>
                          <li>Billing not enabled — bật billing cho project nếu cần.</li>
                          <li>Request denied / Invalid API Key — kiểm tra chuỗi key và giới hạn.</li>
                          <li>Script load failed / Timeout — kiểm tra mạng cục bộ và tường lửa.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          {/* Security Warning (short) */}
          <div className="rounded-xl p-4 border border-rose-200/80 bg-rose-50/60" style={{ boxShadow: "var(--shadow-sm)" }}>
            <h3 className="font-bold text-sm text-rose-900 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center text-sm">⚠️</span>
              Cảnh báo bảo mật
            </h3>
            <ul className="text-sm text-rose-800 space-y-2">
              <li className="flex items-start gap-2"><span className="mt-0.5">🚫</span><span>Không commit <code className="font-mono">.env.local</code> lên GitHub.</span></li>
              <li className="flex items-start gap-2"><span className="mt-0.5">🔒</span><span>Không dán API key trực tiếp vào code nguồn.</span></li>
              <li className="flex items-start gap-2"><span className="mt-0.5">⚙️</span><span>Khi deploy, cấu hình key ở Environment Variables của hosting.</span></li>
              <li className="flex items-start gap-2"><span className="mt-0.5">🌐</span><span>Nên giới hạn API key bằng HTTP referrers trong Google Cloud.</span></li>
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
