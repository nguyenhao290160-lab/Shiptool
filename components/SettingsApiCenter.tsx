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

  useEffect(() => {
    const timer = setTimeout(async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      setIsApiKeySet(isApiKeyConfigured(apiKey));
      setApiKeyMasked(maskApiKey(apiKey));
      setOrdersCount(getDeliveryOrdersCount());
      setRoutesCount(getRoutePlansCount());
      setStorageSize(getLocalStorageSize());
      setStorageKeys(getShipRouteStorageKeys());
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
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center py-4 pb-2">
        <h1 className="text-3xl font-black text-slate-900">Cài đặt</h1>
        <p className="text-slate-600 font-medium text-sm">Quản lý API key và cấu hình</p>
      </div>

      {/* API Key Section */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
        <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <span className="text-2xl">🔑</span>
          Google Maps API Key
        </h2>

        {/* Status Card */}
        <div
          className={`rounded-2xl p-4 border-2 ${
            isApiKeySet
              ? "bg-green-50 border-green-200"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-900">Trạng thái</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isApiKeySet
                  ? "bg-green-200 text-green-900"
                  : "bg-yellow-200 text-yellow-900"
              }`}
            >
              {isApiKeySet ? "✓ Đã cấu hình" : "⚠️ Chưa cấu hình"}
            </span>
          </div>
          <p className="text-slate-700 font-mono text-sm">{apiKeyMasked}</p>
        </div>

        {/* Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <span>📋</span> Hướng dẫn cấu hình
          </h3>
          <div className="space-y-2 text-sm text-blue-900">
            <p>
              <strong>Bước 1:</strong> Tạo file <code className="bg-white px-2 py-1 rounded font-mono text-xs">.env.local</code> ở thư mục gốc project.
            </p>
            <p>
              <strong>Bước 2:</strong> Thêm dòng sau vào file:
            </p>
            <div className="bg-white rounded-lg p-3 font-mono text-xs overflow-x-auto my-2">
              <div>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here</div>
            </div>
            <p>
              <strong>Bước 3:</strong> Thay <code className="bg-white px-2 py-1 rounded font-mono text-xs">your_api_key_here</code> bằng API key thật của bạn từ Google Cloud.
            </p>
            <p>
              <strong>Bước 4:</strong> Restart dev server bằng <code className="bg-white px-2 py-1 rounded font-mono text-xs">npm run dev</code>.
            </p>
            <p className="text-xs text-blue-800 mt-2">
              💡 <strong>Lưu ý:</strong> Không commit file <code className="bg-white px-1 rounded font-mono text-xs">.env.local</code> lên GitHub!
            </p>
          </div>
        </div>

        {/* API Checklist */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <span>✓</span> APIs cần bật trong Google Cloud
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-lg">🗺️</span>
              <span className="text-slate-700">Maps JavaScript API</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">📍</span>
              <span className="text-slate-700">Geocoding API</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">🛣️</span>
              <span className="text-slate-700">Directions API</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg">📊</span>
              <span className="text-slate-700">Distance Matrix API</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-3 bg-white rounded p-2">
            💡 App không thể tự biết API nào đã bật nếu chưa gọi thử. Hãy kiểm tra trạng thái trong Google Cloud Console.
          </p>
        </div>

        {/* Security Warning */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
          <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
            <span>⚠️</span> Cảnh báo bảo mật
          </h3>
          <ul className="text-sm text-red-900 space-y-1">
            <li>🔒 Không commit file <code className="bg-white px-1 rounded font-mono text-xs">.env.local</code> lên GitHub</li>
            <li>🚫 Không dán API key trực tiếp vào code nguồn</li>
            <li>🌍 Giới hạn API key theo domain/IP trong Google Cloud nếu deploy sau này</li>
          </ul>
        </div>
      </div>

      {/* System Status Section */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
        <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <span className="text-2xl">🔌</span>
          Trạng thái hệ thống
        </h2>
        <SystemStatusCard swSupported={swSupported} swRegistered={swRegistered} />
      </div>

      {/* Local Data Section */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
        <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <span className="text-2xl">💾</span>
          Dữ liệu cục bộ
        </h2>
        <LocalDataStatusCard
          ordersCount={ordersCount}
          routesCount={routesCount}
          storageSize={storageSize}
          storageKeys={storageKeys}
        />
      </div>

      {/* System Health Check Section */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
        <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <span className="text-2xl">✓</span>
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

      {/* Shortcuts Section */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-4">
        <SettingsShortcutGrid />
      </div>

      {/* Info Section */}
      <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3">📝 Thông tin thêm</h3>
        <ul className="text-sm text-slate-700 space-y-2">
          <li>
            ✓ Tất cả dữ liệu đơn giao, tuyến đường được lưu cục bộ (localStorage).
          </li>
          <li>
            ✓ Khi offline, app vẫn hoạt động bình thường cho dữ liệu local.
          </li>
          <li>
            ⚠️ Google Maps API, Geocoding, Directions, Distance Matrix cần internet.
          </li>
          <li>
            💾 Có thể backup/export dữ liệu để tránh mất.
          </li>
          <li>
            🔄 PWA giúp cài app nhanh hơn và mở trang nhanh hơn.
          </li>
        </ul>
      </div>
    </div>
  );
}
