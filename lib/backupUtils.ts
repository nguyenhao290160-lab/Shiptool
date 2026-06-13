/**
 * Local data backup, export, and import utilities for ShipRoute AI.
 * Supports exporting to JSON and CSV, importing backups, and managing local data.
 */

import { DeliveryOrder, DeliveryRoutePlan, RouteHistoryItem, OperatingCostSettings, FrequentCustomer } from "./types";

const ORDERS_KEY = "shiproute_delivery_orders";
const ROUTE_PLAN_KEY = "shiproute_route_plan";

export interface ShipRouteBackupData {
  version: string;
  exportedAt: string;
  appName: "ShipRoute AI";
  orders?: DeliveryOrder[];
  routePlan?: DeliveryRoutePlan | null;
  routeHistory?: RouteHistoryItem[];
  costSettings?: OperatingCostSettings;
  customers?: FrequentCustomer[];
  metadata?: {
    totalOrders?: number;
    totalRoutePoints?: number;
    appVersion?: string;
  };
}

/**
 * Get all ShipRoute AI data from localStorage
 */
export const getAllLocalData = (): ShipRouteBackupData => {
  if (typeof window === "undefined") {
    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      appName: "ShipRoute AI",
      orders: [],
      routePlan: null,
      metadata: {},
    };
  }

  try {
    const orders = localStorage.getItem(ORDERS_KEY);
    const routePlan = localStorage.getItem(ROUTE_PLAN_KEY);
    const routeHistory = localStorage.getItem("shiproute_route_history");
    const costSettings = localStorage.getItem("shiproute_cost_settings");
    const customers = localStorage.getItem("shiproute_frequent_customers");

    const parsedOrders = orders ? (JSON.parse(orders) as DeliveryOrder[]) : [];
    const parsedRoutePlan = routePlan
      ? (JSON.parse(routePlan) as DeliveryRoutePlan)
      : null;
    const parsedRouteHistory = routeHistory ? (JSON.parse(routeHistory) as RouteHistoryItem[]) : [];
    const parsedCostSettings = costSettings ? (JSON.parse(costSettings) as OperatingCostSettings) : undefined;
    const parsedCustomers = customers ? (JSON.parse(customers) as FrequentCustomer[]) : [];

    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      appName: "ShipRoute AI",
      orders: parsedOrders,
      routePlan: parsedRoutePlan,
      routeHistory: parsedRouteHistory,
      costSettings: parsedCostSettings,
      customers: parsedCustomers,
      metadata: {
        totalOrders: parsedOrders.length,
        totalRoutePoints: parsedRoutePlan?.points?.length || 0,
        appVersion: "1.0",
      },
    };
  } catch (err) {
    console.error("[backupUtils] getAllLocalData error", err);
    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      appName: "ShipRoute AI",
      orders: [],
      routePlan: null,
      metadata: {},
    };
  }
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
  const fileName = `shiproute-backup-${dateStr}.json`;

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Validate backup data structure
 */
export const validateBackupData = (data: unknown): {
  valid: boolean;
  message?: string;
} => {
  if (!data || typeof data !== "object") {
    return { valid: false, message: "Dữ liệu backup không hợp lệ" };
  }

  const backup = data as Record<string, unknown>;

  if (backup.appName !== "ShipRoute AI") {
    return {
      valid: false,
      message: "Đây không phải file backup của ShipRoute AI",
    };
  }

  if (!backup.version || !backup.exportedAt) {
    return {
      valid: false,
      message: "File backup thiếu thông tin cần thiết",
    };
  }

  return { valid: true };
};

/**
 * Import backup JSON and restore to localStorage
 */
export const importBackupJSON = (data: ShipRouteBackupData): {
  success: boolean;
  message: string;
} => {
  if (typeof window === "undefined") {
    return { success: false, message: "Không thể nhập backup ở server" };
  }

  try {
    const validation = validateBackupData(data);
    if (!validation.valid) {
      return { success: false, message: validation.message || "Dữ liệu không hợp lệ" };
    }

    // Restore orders
    if (data.orders && Array.isArray(data.orders)) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(data.orders));
    }

    // Restore route plan
    if (data.routePlan) {
      localStorage.setItem(ROUTE_PLAN_KEY, JSON.stringify(data.routePlan));
    } else {
      localStorage.removeItem(ROUTE_PLAN_KEY);
    }

    // Restore route history (if present)
    if (data.routeHistory && Array.isArray(data.routeHistory)) {
      localStorage.setItem("shiproute_route_history", JSON.stringify(data.routeHistory));
    }

    // Restore cost settings (Prompt 15)
    if (data.costSettings) {
      localStorage.setItem("shiproute_cost_settings", JSON.stringify(data.costSettings));
    }

    // Restore customers (Prompt 16A)
    if (data.customers && Array.isArray(data.customers)) {
      localStorage.setItem("shiproute_frequent_customers", JSON.stringify(data.customers));
    }

    return {
      success: true,
      message: `Khôi phục thành công: ${data.metadata?.totalOrders || 0} đơn, ${data.metadata?.totalRoutePoints || 0} điểm tuyến`,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi không xác định";
    return {
      success: false,
      message: `Không thể nhập backup: ${errorMsg}`,
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

  // If field contains comma, newline, or double quote, wrap in quotes and escape quotes
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
    const orders = (() => {
      try {
        const raw = localStorage.getItem(ORDERS_KEY);
        return raw ? (JSON.parse(raw) as DeliveryOrder[]) : [];
      } catch {
        return [];
      }
    })();

    if (orders.length === 0) {
      alert("Chưa có đơn giao hàng để xuất");
      return;
    }

    // CSV headers
    const headers = [
      "Tên khách",
      "Số điện thoại",
      "Địa chỉ",
      "Ghi chú",
      "Trạng thái",
      "Ưu tiên",
      "Vĩ độ",
      "Kinh độ",
      "Địa chỉ geocoded",
      "Ngày tạo",
      "Ngày cập nhật",
    ];

    // CSV rows
    const rows = orders.map((order) => [
      escapeCsvField(order.customerName),
      escapeCsvField(order.phone),
      escapeCsvField(order.address),
      escapeCsvField(order.note),
      escapeCsvField(order.status),
      escapeCsvField(order.priority),
      order.lat ? escapeCsvField(order.lat) : "",
      order.lng ? escapeCsvField(order.lng) : "",
      escapeCsvField(order.geocodedAddress),
      escapeCsvField(formatDateForCsv(order.createdAt)),
      escapeCsvField(formatDateForCsv(order.updatedAt)),
    ]);

    // Build CSV string
    const csvContent =
      [headers, ...rows].map((row) => row.join(",")).join("\n") + "\n";

    // Download
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
 * Calculate approximate localStorage size in bytes
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
 * Clear all ShipRoute AI local data
 */
export const clearAllLocalData = (): { success: boolean; message: string } => {
  if (typeof window === "undefined") {
    return { success: false, message: "Không thể xóa dữ liệu ở server" };
  }

  try {
    // Remove all ShipRoute AI related keys
    const keysToRemove = Array.from({ length: localStorage.length }, (_, i) => {
      const key = localStorage.key(i);
      return key;
    })
      .filter((key) => key && key.startsWith("shiproute_"))
      .filter((key): key is string => key !== null);

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    return {
      success: true,
      message: `Đã xóa ${keysToRemove.length} mục dữ liệu`,
    };
  } catch (err) {
    return {
      success: false,
      message: `Lỗi khi xóa dữ liệu: ${err instanceof Error ? err.message : "unknown"}`,
    };
  }
};

/**
 * Get count of orders and route points
 */
export const getDataStats = (): {
  orderCount: number;
  routePointCount: number;
} => {
  const backup = getAllLocalData();
  return {
    orderCount: backup.orders?.length || 0,
    routePointCount: backup.routePlan?.points?.length || 0,
  };
};
