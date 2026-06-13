/**
 * Local data backup, export, and import utilities for ShipRoute AI.
 * Supports exporting to JSON and CSV, importing backups (merge/replace), safety backups, and managing local data.
 */

import { DeliveryOrder, DeliveryRoutePlan, RouteHistoryItem, OperatingCostSettings, FrequentCustomer, RoutePlan } from "./types";

const ORDERS_KEY = "shiproute_delivery_orders";
const ROUTES_KEY = "shiproute_routes";
const ROUTE_PLAN_KEY = "shiproute_route_plan";
const HISTORY_KEY = "shiproute_route_history";
const COST_SETTINGS_KEY = "shiproute_cost_settings";
const CUSTOMERS_KEY = "shiproute_frequent_customers";
const LAST_BACKUP_KEY = "shiproute_last_backup_time";

export interface ShipRouteBackupData {
  app: "ShipRoute AI";
  version: string;
  exportedAt: string;
  data: {
    orders: DeliveryOrder[];
    routes: RoutePlan[];
    routePlan: DeliveryRoutePlan | null;
    routeHistory: RouteHistoryItem[];
    customers: FrequentCustomer[];
    settings: {
      costSettings?: OperatingCostSettings;
    };
  };
}

/**
 * Helper to safely parse JSON
 */
function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Get all ShipRoute AI data from localStorage in the new structured format
 */
export const getAllLocalData = (): ShipRouteBackupData => {
  if (typeof window === "undefined") {
    return {
      app: "ShipRoute AI",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      data: {
        orders: [],
        routes: [],
        routePlan: null,
        routeHistory: [],
        customers: [],
        settings: {},
      },
    };
  }

  const orders = safeParse<DeliveryOrder[]>(localStorage.getItem(ORDERS_KEY), []);
  const routes = safeParse<RoutePlan[]>(localStorage.getItem(ROUTES_KEY), []);
  const routePlan = safeParse<DeliveryRoutePlan | null>(localStorage.getItem(ROUTE_PLAN_KEY), null);
  const routeHistory = safeParse<RouteHistoryItem[]>(localStorage.getItem(HISTORY_KEY), []);
  const costSettings = safeParse<OperatingCostSettings | undefined>(localStorage.getItem(COST_SETTINGS_KEY), undefined);
  const customers = safeParse<FrequentCustomer[]>(localStorage.getItem(CUSTOMERS_KEY), []);

  return {
    app: "ShipRoute AI",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    data: {
      orders,
      routes,
      routePlan,
      routeHistory,
      customers,
      settings: {
        costSettings,
      },
    },
  };
};

/**
 * Export backup data as JSON and trigger download
 */
export const exportBackupJSON = (): void => {
  if (typeof window === "undefined") return;

  const data = getAllLocalData();
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const fileName = `shiproute-ai-backup-${dateStr}.json`;

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  // Update last backup time
  localStorage.setItem(LAST_BACKUP_KEY, now.toISOString());
};

/**
 * Validate backup data structure
 */
export const validateBackupData = (data: unknown): {
  valid: boolean;
  message?: string;
} => {
  if (!data || typeof data !== "object") {
    return { valid: false, message: "Dữ liệu sao lưu không hợp lệ." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const backup = data as Record<string, any>;

  // Check app name (support appName for backward compatibility)
  const app = backup.app || backup.appName;
  if (app !== "ShipRoute AI") {
    return {
      valid: false,
      message: "Tệp tin không thuộc ứng dụng ShipRoute AI.",
    };
  }

  if (!backup.version || !backup.exportedAt) {
    return {
      valid: false,
      message: "File sao lưu thiếu thông tin phiên bản hoặc ngày xuất.",
    };
  }

  // Validate the nested arrays if new structure, or the flat fields if old
  const d = backup.data || backup;
  if (d.orders && !Array.isArray(d.orders)) {
    return { valid: false, message: "Danh sách đơn hàng (orders) không hợp lệ." };
  }
  if (d.routes && !Array.isArray(d.routes)) {
    return { valid: false, message: "Danh sách tuyến đường active (routes) không hợp lệ." };
  }
  if (d.routeHistory && !Array.isArray(d.routeHistory)) {
    return { valid: false, message: "Lịch sử tuyến đường (routeHistory) không hợp lệ." };
  }
  if (d.customers && !Array.isArray(d.customers)) {
    return { valid: false, message: "Danh sách khách hàng (customers) không hợp lệ." };
  }

  return { valid: true };
};

/**
 * Create safety backup in sessionStorage
 */
export const createSafetyBackup = (): void => {
  if (typeof window === "undefined") return;
  try {
    const currentData = getAllLocalData();
    sessionStorage.setItem("shiproute_safety_backup", JSON.stringify(currentData));
  } catch (err) {
    console.error("Failed to create safety backup", err);
  }
};

/**
 * Check if safety backup is present in sessionStorage
 */
export const hasSafetyBackup = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!sessionStorage.getItem("shiproute_safety_backup");
};

/**
 * Restore from safety backup in sessionStorage
 */
export const restoreSafetyBackup = (): { success: boolean; message: string } => {
  if (typeof window === "undefined") {
    return { success: false, message: "Không thể phục hồi ở phía máy chủ." };
  }
  try {
    const raw = sessionStorage.getItem("shiproute_safety_backup");
    if (!raw) {
      return { success: false, message: "Không tìm thấy bản sao lưu an toàn." };
    }
    const data = JSON.parse(raw) as ShipRouteBackupData;
    const result = replaceLocalData(data);
    if (result.success) {
      sessionStorage.removeItem("shiproute_safety_backup");
    }
    return result;
  } catch (err) {
    return {
      success: false,
      message: `Lỗi phục hồi: ${err instanceof Error ? err.message : "unknown"}`,
    };
  }
};

/**
 * Import backup JSON: Replace existing local storage data entirely
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const replaceLocalData = (data: any): {
  success: boolean;
  message: string;
} => {
  if (typeof window === "undefined") {
    return { success: false, message: "Không thể nhập backup ở server." };
  }

  try {
    const validation = validateBackupData(data);
    if (!validation.valid) {
      return { success: false, message: validation.message || "Dữ liệu không hợp lệ." };
    }

    // Capture safety backup first
    createSafetyBackup();

    const d = data.data || data;

    // 1. Orders
    if (d.orders && Array.isArray(d.orders)) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(d.orders));
    } else {
      localStorage.removeItem(ORDERS_KEY);
    }

    // 2. Active routes (routes)
    if (d.routes && Array.isArray(d.routes)) {
      localStorage.setItem(ROUTES_KEY, JSON.stringify(d.routes));
    } else {
      localStorage.removeItem(ROUTES_KEY);
    }

    // 3. Route plan (currently drawing plan)
    if (d.routePlan) {
      localStorage.setItem(ROUTE_PLAN_KEY, JSON.stringify(d.routePlan));
    } else {
      localStorage.removeItem(ROUTE_PLAN_KEY);
    }

    // 4. Route history
    if (d.routeHistory && Array.isArray(d.routeHistory)) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(d.routeHistory));
    } else {
      localStorage.removeItem(HISTORY_KEY);
    }

    // 5. Cost settings
    const costSettings = d.settings?.costSettings || d.costSettings;
    if (costSettings) {
      localStorage.setItem(COST_SETTINGS_KEY, JSON.stringify(costSettings));
    } else {
      localStorage.removeItem(COST_SETTINGS_KEY);
    }

    // 6. Customers
    if (d.customers && Array.isArray(d.customers)) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(d.customers));
    } else {
      localStorage.removeItem(CUSTOMERS_KEY);
    }

    return {
      success: true,
      message: "Khôi phục thay thế thành công dữ liệu từ file sao lưu.",
    };
  } catch (err) {
    return {
      success: false,
      message: `Lỗi khôi phục thay thế: ${err instanceof Error ? err.message : "unknown"}`,
    };
  }
};

/**
 * Import backup JSON: Merge with existing local storage data (de-duplicate by ID)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mergeLocalData = (data: any): {
  success: boolean;
  message: string;
} => {
  if (typeof window === "undefined") {
    return { success: false, message: "Không thể nhập backup ở server." };
  }

  try {
    const validation = validateBackupData(data);
    if (!validation.valid) {
      return { success: false, message: validation.message || "Dữ liệu không hợp lệ." };
    }

    // Capture safety backup first
    createSafetyBackup();

    const d = data.data || data;

    // 1. Merge Orders
    const incomingOrders = (d.orders || []) as DeliveryOrder[];
    const currentOrders = safeParse<DeliveryOrder[]>(localStorage.getItem(ORDERS_KEY), []);
    const ordersMap = new Map<string, DeliveryOrder>();
    currentOrders.forEach((item) => ordersMap.set(item.id, item));
    incomingOrders.forEach((item) => ordersMap.set(item.id, item));
    localStorage.setItem(ORDERS_KEY, JSON.stringify(Array.from(ordersMap.values())));

    // 2. Merge Active Routes (routes)
    const incomingRoutes = (d.routes || []) as RoutePlan[];
    const currentRoutes = safeParse<RoutePlan[]>(localStorage.getItem(ROUTES_KEY), []);
    const routesMap = new Map<string, RoutePlan>();
    currentRoutes.forEach((item) => routesMap.set(item.id, item));
    incomingRoutes.forEach((item) => routesMap.set(item.id, item));
    localStorage.setItem(ROUTES_KEY, JSON.stringify(Array.from(routesMap.values())));

    // 3. Merge Route plan (draw plan) - replace if incoming is present
    if (d.routePlan) {
      localStorage.setItem(ROUTE_PLAN_KEY, JSON.stringify(d.routePlan));
    }

    // 4. Merge Route history
    const incomingHistory = (d.routeHistory || []) as RouteHistoryItem[];
    const currentHistory = safeParse<RouteHistoryItem[]>(localStorage.getItem(HISTORY_KEY), []);
    const historyMap = new Map<string, RouteHistoryItem>();
    currentHistory.forEach((item) => historyMap.set(item.id, item));
    incomingHistory.forEach((item) => historyMap.set(item.id, item));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(Array.from(historyMap.values())));

    // 5. Merge Cost settings - replace if incoming settings are defined
    const costSettings = d.settings?.costSettings || d.costSettings;
    if (costSettings) {
      localStorage.setItem(COST_SETTINGS_KEY, JSON.stringify(costSettings));
    }

    // 6. Merge Customers
    const incomingCustomers = (d.customers || []) as FrequentCustomer[];
    const currentCustomers = safeParse<FrequentCustomer[]>(localStorage.getItem(CUSTOMERS_KEY), []);
    const customersMap = new Map<string, FrequentCustomer>();
    currentCustomers.forEach((item) => customersMap.set(item.id, item));
    incomingCustomers.forEach((item) => customersMap.set(item.id, item));
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(Array.from(customersMap.values())));

    return {
      success: true,
      message: "Gộp dữ liệu thành công. Không ghi đè các dữ liệu độc nhất hiện tại.",
    };
  } catch (err) {
    return {
      success: false,
      message: `Lỗi gộp dữ liệu: ${err instanceof Error ? err.message : "unknown"}`,
    };
  }
};

/**
 * Format date for CSV (remove special characters)
 */
const formatDateForCsv = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleString("vi-VN");
  } catch {
    return dateStr;
  }
};

/**
 * Escape CSV field value
 */
const escapeCsvField = (field: unknown): string => {
  if (field === null || field === undefined) return "";
  const str = String(field);
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Export orders as CSV
 */
export const exportOrdersCSV = (): void => {
  if (typeof window === "undefined") return;

  try {
    const orders = safeParse<DeliveryOrder[]>(localStorage.getItem(ORDERS_KEY), []);

    if (orders.length === 0) {
      alert("Chưa có đơn giao hàng để xuất");
      return;
    }

    const headers = [
      "Tên khách",
      "Số điện thoại",
      "Địa chỉ",
      "Ghi chú",
      "Khung giờ giao",
      "Trạng thái",
      "Ưu tiên",
      "Vĩ độ",
      "Kinh độ",
      "Địa chỉ geocoded",
      "Ngày tạo",
      "Ngày cập nhật",
    ];

    const rows = orders.map((order) => [
      escapeCsvField(order.customerName),
      escapeCsvField(order.phone),
      escapeCsvField(order.address),
      escapeCsvField(order.note),
      order.deliveryWindow ? escapeCsvField(order.deliveryWindow) : "",
      escapeCsvField(order.status),
      escapeCsvField(order.priority),
      order.lat ? escapeCsvField(order.lat) : "",
      order.lng ? escapeCsvField(order.lng) : "",
      escapeCsvField(order.geocodedAddress),
      escapeCsvField(formatDateForCsv(order.createdAt)),
      escapeCsvField(formatDateForCsv(order.updatedAt)),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const fileName = `shiproute-orders-${dateStr}.csv`;

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("[backupUtils] exportOrdersCSV error", err);
    alert("Lỗi khi xuất CSV: " + (err instanceof Error ? err.message : "unknown"));
  }
};

/**
 * Calculate approximate localStorage size in bytes for shiproute_ items
 */
export const calculateLocalStorageSize = (): number => {
  if (typeof window === "undefined") return 0;

  let size = 0;
  try {
    for (const key in localStorage) {
      if (key.startsWith("shiproute_")) {
        const value = localStorage.getItem(key);
        if (value) {
          size += key.length + value.length;
        }
      }
    }
  } catch (err) {
    console.error("[backupUtils] calculateLocalStorageSize error", err);
  }
  return size;
};

/**
 * Format storage size to human readable string
 */
export const formatStorageSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Clear all ShipRoute AI local data (except env files, which are backend-only anyway)
 */
export const clearAllLocalData = (): { success: boolean; message: string } => {
  if (typeof window === "undefined") {
    return { success: false, message: "Không thể xóa dữ liệu ở server." };
  }

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("shiproute_")) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    return {
      success: true,
      message: `Đã xóa sạch thành công ${keysToRemove.length} khóa dữ liệu cục bộ.`,
    };
  } catch (err) {
    return {
      success: false,
      message: `Lỗi khi xóa dữ liệu: ${err instanceof Error ? err.message : "unknown"}`,
    };
  }
};

/**
 * Get count of orders, active routes, history routes, and customers
 */
export const getFullDataStats = (): {
  orderCount: number;
  routesCount: number;
  historyCount: number;
  customerCount: number;
  lastBackupTime: string | null;
} => {
  if (typeof window === "undefined") {
    return { orderCount: 0, routesCount: 0, historyCount: 0, customerCount: 0, lastBackupTime: null };
  }

  const orders = safeParse<DeliveryOrder[]>(localStorage.getItem(ORDERS_KEY), []);
  const routes = safeParse<RoutePlan[]>(localStorage.getItem(ROUTES_KEY), []);
  const history = safeParse<RouteHistoryItem[]>(localStorage.getItem(HISTORY_KEY), []);
  const customers = safeParse<FrequentCustomer[]>(localStorage.getItem(CUSTOMERS_KEY), []);
  const lastBackupTime = localStorage.getItem(LAST_BACKUP_KEY);

  return {
    orderCount: orders.length,
    routesCount: routes.length,
    historyCount: history.length,
    customerCount: customers.length,
    lastBackupTime,
  };
};
