import { DeliveryOrder, DeliveryStatus, DeliveryPriority } from "./types";

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  deliveringOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  cancelledOrders: number;
  highPriorityOrders: number;
  normalPriorityOrders: number;
  lowPriorityOrders: number;
  ordersWithCoordinates: number;
  ordersMissingCoordinates: number;
  successRate: number;
  pendingRate: number;
  failureRate: number;
  activeOrders: number;
}

export interface FilterOptions {
  dateRange: "all" | "today" | "7days" | "30days";
  status: DeliveryStatus | "all";
  priority: DeliveryPriority | "all";
}

export const calculateDashboardStats = (
  orders: DeliveryOrder[]
): DashboardStats => {
  const total = orders.length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const delivering = orders.filter((o) => o.status === "delivering").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const failed = orders.filter((o) => o.status === "failed").length;
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  const highPriority = orders.filter((o) => o.priority === "high").length;
  const normalPriority = orders.filter((o) => o.priority === "normal").length;
  const lowPriority = orders.filter((o) => o.priority === "low").length;
  const withCoords = orders.filter((o) => o.lat != null && o.lng != null).length;
  const missingCoords = total - withCoords;

  const completedOrders = delivered + failed + cancelled;
  const successRate =
    completedOrders > 0 ? Math.round((delivered / completedOrders) * 100) : 0;
  const failureRate =
    completedOrders > 0 ? Math.round(((failed + cancelled) / completedOrders) * 100) : 0;
  const activeOrders = pending + delivering;

  return {
    totalOrders: total,
    pendingOrders: pending,
    deliveringOrders: delivering,
    deliveredOrders: delivered,
    failedOrders: failed,
    cancelledOrders: cancelled,
    highPriorityOrders: highPriority,
    normalPriorityOrders: normalPriority,
    lowPriorityOrders: lowPriority,
    ordersWithCoordinates: withCoords,
    ordersMissingCoordinates: missingCoords,
    successRate,
    pendingRate: total > 0 ? Math.round(((pending + delivering) / total) * 100) : 0,
    failureRate,
    activeOrders,
  };
};

export const filterOrdersByDateRange = (
  orders: DeliveryOrder[],
  range: "all" | "today" | "7days" | "30days"
): DeliveryOrder[] => {
  if (range === "all") return orders;

  const now = new Date();
  let daysAgo = 0;

  if (range === "today") {
    daysAgo = 0;
  } else if (range === "7days") {
    daysAgo = 7;
  } else if (range === "30days") {
    daysAgo = 30;
  }

  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

  return orders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= cutoffDate;
  });
};

export const filterOrdersByStatus = (
  orders: DeliveryOrder[],
  status: DeliveryStatus | "all"
): DeliveryOrder[] => {
  if (status === "all") return orders;
  return orders.filter((o) => o.status === status);
};

export const filterOrdersByPriority = (
  orders: DeliveryOrder[],
  priority: DeliveryPriority | "all"
): DeliveryOrder[] => {
  if (priority === "all") return orders;
  return orders.filter((o) => o.priority === priority);
};

export const applyFilters = (
  orders: DeliveryOrder[],
  filters: FilterOptions
): DeliveryOrder[] => {
  let result = orders;
  result = filterOrdersByDateRange(result, filters.dateRange);
  result = filterOrdersByStatus(result, filters.status);
  result = filterOrdersByPriority(result, filters.priority);
  return result;
};

export const getRecentOrders = (
  orders: DeliveryOrder[],
  limit: number = 5
): DeliveryOrder[] => {
  return [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
};

export const getPendingOrders = (
  orders: DeliveryOrder[],
  limit: number = 5
): DeliveryOrder[] => {
  const pending = orders.filter(
    (o) => o.status === "pending" || o.status === "delivering"
  );
  return pending
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
};

export const truncateAddress = (address: string, maxLength: number = 35): string => {
  return address.length > maxLength ? address.slice(0, maxLength) + "..." : address;
};

export const getStatusLabel = (status: DeliveryStatus): string => {
  const labels: Record<DeliveryStatus, string> = {
    pending: "Chờ giao",
    delivering: "Đang giao",
    delivered: "Đã giao",
    failed: "Thất bại",
    cancelled: "Đã hủy",
  };
  return labels[status];
};

export const getStatusColor = (
  status: DeliveryStatus
): "text-amber-600" | "text-cyan-600" | "text-green-600" | "text-red-600" | "text-slate-500" => {
  const colors: Record<
    DeliveryStatus,
    "text-amber-600" | "text-cyan-600" | "text-green-600" | "text-red-600" | "text-slate-500"
  > = {
    pending: "text-amber-600",
    delivering: "text-cyan-600",
    delivered: "text-green-600",
    failed: "text-red-600",
    cancelled: "text-slate-500",
  };
  return colors[status];
};

export const getStatusBgColor = (
  status: DeliveryStatus
): "bg-amber-50" | "bg-cyan-50" | "bg-green-50" | "bg-red-50" | "bg-slate-50" => {
  const colors: Record<
    DeliveryStatus,
    "bg-amber-50" | "bg-cyan-50" | "bg-green-50" | "bg-red-50" | "bg-slate-50"
  > = {
    pending: "bg-amber-50",
    delivering: "bg-cyan-50",
    delivered: "bg-green-50",
    failed: "bg-red-50",
    cancelled: "bg-slate-50",
  };
  return colors[status];
};

export const getPriorityLabel = (priority: DeliveryPriority): string => {
  const labels: Record<DeliveryPriority, string> = {
    high: "Cao",
    normal: "Bình thường",
    low: "Thấp",
  };
  return labels[priority];
};
