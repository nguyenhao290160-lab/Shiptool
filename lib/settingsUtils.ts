/**
 * Utility functions for Settings/API Center
 */

/**
 * Mask API key to show only first 4 and last 4 characters
 * Example: "AIzaSyDummyKeyExample1234567890" → "AIza...1234"
 */
export function maskApiKey(key: string | undefined): string {
  if (!key || key.length < 8) {
    return "Chưa cấu hình";
  }
  const first = key.substring(0, 4);
  const last = key.substring(key.length - 4);
  return `${first}...${last}`;
}

/**
 * Check if API key is configured
 */
export function isApiKeyConfigured(key: string | undefined): boolean {
  return !!key && key.length > 0;
}

/**
 * Get approximate localStorage usage in KB
 */
export function getLocalStorageSize(): number {
  if (typeof window === "undefined") return 0;
  let size = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      size += localStorage[key].length + key.length;
    }
  }
  return Math.round((size / 1024) * 100) / 100; // KB with 2 decimal places
}

/**
 * Check localStorage availability
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get count of delivery orders from localStorage
 */
export function getDeliveryOrdersCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const orders = localStorage.getItem("shiproute_delivery_orders");
    if (!orders) return 0;
    const parsed = JSON.parse(orders);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Get count of route plans from localStorage
 */
export function getRoutePlansCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const routes = localStorage.getItem("shiproute_route_plan");
    if (!routes) return 0;
    const parsed = JSON.parse(routes);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Get list of ShipRoute storage keys
 */
export function getShipRouteStorageKeys(): string[] {
  if (typeof window === "undefined") return [];
  const shipRouteKeys: string[] = [];
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key) && key.startsWith("shiproute_")) {
      shipRouteKeys.push(key);
    }
  }
  return shipRouteKeys.sort();
}

/**
 * Check if service worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator;
}

/**
 * Check if service worker is registered
 */
export async function isServiceWorkerRegistered(): Promise<boolean> {
  if (!isServiceWorkerSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return !!registration;
  } catch {
    return false;
  }
}

/**
 * Check if backup data exists in localStorage
 */
export function hasBackupData(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const lastBackupTime = localStorage.getItem("shiproute_last_backup_time");
    return !!lastBackupTime;
  } catch {
    return false;
  }
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
