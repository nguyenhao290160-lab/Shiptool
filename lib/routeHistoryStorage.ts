import { RouteHistoryItem, DeliveryRoutePlan, RouteHistoryPoint } from "./types";

const HISTORY_KEY = "shiproute_route_history";

export const getRouteHistory = (): RouteHistoryItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as RouteHistoryItem[]) : [];
  } catch (err) {
    console.error("Failed to parse route history", err);
    return [];
  }
};

export const saveRouteHistoryItem = (item: RouteHistoryItem): void => {
  if (typeof window === "undefined") return;
  const list = getRouteHistory();
  const idx = list.findIndex((r) => r.id === item.id);
  if (idx >= 0) {
    list[idx] = item;
  } else {
    list.push(item);
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
};

export const updateRouteHistoryItem = (id: string, patch: Partial<RouteHistoryItem>): void => {
  if (typeof window === "undefined") return;
  const list = getRouteHistory();
  const idx = list.findIndex((r) => r.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  }
};

export const deleteRouteHistoryItem = (id: string): void => {
  if (typeof window === "undefined") return;
  const list = getRouteHistory().filter((r) => r.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
};

export const clearRouteHistory = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
};

export const createHistoryFromRoutePlan = (
  plan: DeliveryRoutePlan,
  opts?: {
    name?: string;
    note?: string;
    status?: RouteHistoryItem["status"];
    totalDistanceMeters?: number;
    totalDurationSeconds?: number;
    distanceText?: string;
    durationText?: string;
    optimizedBy?: RouteHistoryItem["optimizedBy"];
  }
): RouteHistoryItem => {
  const now = new Date().toISOString();
  const id = Date.now().toString();

  const points: RouteHistoryPoint[] = plan.points.map((p) => ({
    orderId: p.orderId,
    sequence: p.sequence,
    customerName: p.customerName,
    phone: p.phone,
    address: p.address,
    status: p.status,
    priority: p.priority,
    lat: p.lat,
    lng: p.lng,
    note: p.note,
  }));

  const totalOrders = points.length;
  const deliveredOrders = points.filter((p) => p.status === "delivered").length;
  const failedOrders = points.filter((p) => p.status === "failed").length;
  const cancelledOrders = points.filter((p) => p.status === "cancelled").length;

  const item: RouteHistoryItem = {
    id,
    name: opts?.name || plan.name || `Tuyến ngày ${new Date().toLocaleDateString("vi-VN")}`,
    date: now,
    status: opts?.status || "draft",
    startPoint: plan.startPoint ? { name: plan.startPoint.name, address: plan.startPoint.address, lat: plan.startPoint.lat, lng: plan.startPoint.lng } : undefined,
    points,
    totalOrders,
    deliveredOrders,
    failedOrders,
    cancelledOrders,
    totalDistanceMeters: opts?.totalDistanceMeters,
    totalDurationSeconds: opts?.totalDurationSeconds,
    distanceText: opts?.distanceText,
    durationText: opts?.durationText,
    optimizedBy: opts?.optimizedBy,
    note: opts?.note,
    createdAt: now,
    updatedAt: now,
    completedAt: opts?.status === "completed" ? now : undefined,
  };

  saveRouteHistoryItem(item);
  return item;
};



