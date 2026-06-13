import { DeliveryOrder, DeliveryRoutePlan, FrequentCustomer } from "./types";
import { getDeliveryOrders } from "./deliveryStorage";
import { getRoutePlan } from "./routeStorage";
import { getCostSettings } from "./costStorage";
import { getFrequentCustomers } from "./customerStorage";
import { getRouteHistory } from "./routeHistoryStorage";

export type SuggestionType =
  | "priority"
  | "warning"
  | "route"
  | "cost"
  | "customer"
  | "offline"
  | "data"
  | "success";

export interface SmartSuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  message: string;
  severity: "info" | "success" | "warning" | "danger";
  actionLabel?: string;
  actionHref?: string;
  relatedOrderIds?: string[];
  createdAt: string;
}

const nowIso = () => new Date().toISOString();

export const findHighPriorityPendingOrders = (orders: DeliveryOrder[]) =>
  orders.filter((o) => o.priority === "high" && o.status === "pending");

export const findOrdersMissingCoordinates = (orders: DeliveryOrder[]) =>
  orders.filter((o) => !o.lat && !o.lng);

export const findFailedOrCancelledOrders = (orders: DeliveryOrder[]) =>
  orders.filter((o) => o.status === "failed" || o.status === "cancelled");

export const findPotentialRouteIssues = (routePlan: DeliveryRoutePlan | null) => {
  if (!routePlan) return [] as string[];
  const msgs: string[] = [];
  if (routePlan.points.length > 2) {
    // if route plan exists but no indication it's optimized (we don't store that), suggest optimization
    msgs.push("Tuyến hiện tại có nhiều điểm giao. Cân nhắc tối ưu bằng Distance Matrix.");
  }
  return msgs;
};

export const generateCostWarnings = () => {
  // read cost settings and route cost estimate if present in route plan / history
  // no deep analysis here, the cost module provides estimates elsewhere
  return [] as SmartSuggestion[];
};

export const generateCustomerSuggestions = (customers: FrequentCustomer[]) => {
  const suggestions: SmartSuggestion[] = [];
  const withoutCoords = customers.filter((c) => c.lat === undefined || c.lng === undefined);
  if (withoutCoords.length > 0) {
    suggestions.push({
      id: `cust-no-coords-${Date.now()}`,
      type: "customer",
      title: "Khách chưa có tọa độ",
      message: `Có ${withoutCoords.length} khách hàng thường xuyên chưa có tọa độ. Cập nhật tọa độ sẽ giúp lập tuyến chính xác hơn.`,
      severity: "info",
      actionLabel: "Mở Khách hàng",
      actionHref: "/customers",
      createdAt: nowIso(),
    });
  }

  const manyOrders = customers.filter((c) => (c.totalOrders || 0) >= 3);
  if (manyOrders.length > 0) {
    suggestions.push({
      id: `cust-top-${Date.now()}`,
      type: "customer",
      title: "Khách hàng thường xuyên",
      message: `Có ${manyOrders.length} khách hàng thường xuyên có nhiều lần giao. Bạn có thể tạo đơn nhanh từ trang Khách hàng.`,
      severity: "success",
      actionLabel: "Mở Khách hàng",
      actionHref: "/customers",
      createdAt: nowIso(),
    });
  }

  return suggestions;
};

export const generateRouteSummary = (): { title: string; summary: string } => {
  const orders = getDeliveryOrders();
  const routePlan = getRoutePlan();

  const totalOrders = orders.length;
  const highPriority = orders.filter((o) => o.priority === "high").length;
  const withCoords = orders.filter((o) => o.lat !== undefined && o.lng !== undefined).length;
  const withoutCoords = orders.filter((o) => !o.lat && !o.lng).length;

  if (!routePlan || !routePlan.points || routePlan.points.length === 0) {
    return {
      title: "Tóm tắt tuyến hôm nay",
      summary:
        "Chưa có đủ dữ liệu tuyến để tạo tóm tắt chi tiết. Hãy tạo tuyến và lấy tọa độ cho đơn giao trước.",
    };
  }

  const routeMeta = routePlan as unknown as { totalDistanceKm?: number; totalDurationText?: string } | undefined;
  const estKm = routeMeta?.totalDistanceKm;
  const estDuration = routeMeta?.totalDurationText;

  const summaryParts: string[] = [];
  summaryParts.push(`Hôm nay có ${totalOrders} đơn cần xử lý, trong đó ${highPriority} đơn ưu tiên cao.`);
  summaryParts.push(`${withCoords} đơn đã có tọa độ và ${withoutCoords} đơn chưa có tọa độ.`);
  summaryParts.push(`Tuyến hiện tại có ${routePlan.points.length} điểm giao${estKm ? `, ước tính ${estKm} km` : ""}${estDuration ? ` và ${estDuration}` : ""}.`);

  return {
    title: "Tóm tắt tuyến hôm nay",
    summary: summaryParts.join(" "),
  };
};

export const generateSmartSuggestions = (): SmartSuggestion[] => {
  const orders = getDeliveryOrders();
  const routePlan = getRoutePlan();
  const customers = getFrequentCustomers();
  const suggestions: SmartSuggestion[] = [];

  // Offline note - check navigator if available
  const isOffline = typeof navigator !== "undefined" ? !navigator.onLine : false;
  if (isOffline) {
    suggestions.push({
      id: "offline-1",
      type: "offline",
      title: "Bạn đang offline",
      message:
        "Bạn đang offline/local mode. Vẫn có thể quản lý đơn và lập tuyến local, nhưng Google Maps/API có thể không hoạt động.",
      severity: "info",
      actionLabel: "Trạng thái mạng",
      actionHref: "/settings",
      createdAt: nowIso(),
    });
  }

  // High priority pending orders
  const highPending = findHighPriorityPendingOrders(orders);
  if (highPending.length > 0) {
    suggestions.push({
      id: "priority-1",
      type: "priority",
      title: `Đơn ưu tiên cao chưa giao (${highPending.length})`,
      message: `Có ${highPending.length} đơn ưu tiên cao chưa giao. Nên xử lý trước để tránh trễ đơn quan trọng.`,
      severity: "warning",
      actionLabel: "Xem đơn",
      actionHref: "/orders",
      relatedOrderIds: highPending.map((o) => o.id),
      createdAt: nowIso(),
    });
  } else {
    suggestions.push({
      id: "priority-ok",
      type: "priority",
      title: "Không có đơn ưu tiên cao chờ giao",
      message: "Hiện tại không có đơn ưu tiên cao đang chờ giao.",
      severity: "success",
      createdAt: nowIso(),
    });
  }

  // Orders missing coordinates
  const missingCoords = findOrdersMissingCoordinates(orders);
  if (missingCoords.length > 0) {
    suggestions.push({
      id: "coords-1",
      type: "warning",
      title: `Đơn chưa có tọa độ (${missingCoords.length})`,
      message: `Có ${missingCoords.length} đơn chưa có tọa độ. Hãy dùng chức năng Lấy tọa độ để hiển thị marker và tối ưu tuyến chính xác hơn.`,
      severity: "warning",
      actionLabel: "Lấy tọa độ",
      actionHref: "/orders",
      relatedOrderIds: missingCoords.map((o) => o.id),
      createdAt: nowIso(),
    });
  }

  // Route issues
  const routeIssues = findPotentialRouteIssues(routePlan || null);
  if (routeIssues.length > 0) {
    suggestions.push({
      id: "route-1",
      type: "route",
      title: "Tuyến có thể cải thiện",
      message: routeIssues.join(" "),
      severity: "info",
      actionLabel: "Tối ưu tuyến",
      actionHref: "/route-planner",
      createdAt: nowIso(),
    });
  }

  // Cost warnings (simple): if routePlan includes costEstimate and profit negative
  const routeHistory = getRouteHistory();
  const lastRoute = routeHistory && routeHistory.length > 0 ? routeHistory[routeHistory.length - 1] : null;
  if (lastRoute && lastRoute.costEstimate) {
    const est = lastRoute.costEstimate;
    if (est.estimatedProfit < 0) {
      suggestions.push({
        id: "cost-loss",
        type: "cost",
        title: "Tuyến có lợi nhuận âm",
        message: `Tuyến này đang có lợi nhuận ước tính âm (${est.estimatedProfit}). Hãy kiểm tra lại phí ship hoặc chi phí vận hành.`,
        severity: "danger",
        actionLabel: "Xem chi phí",
        actionHref: "/route-planner",
        createdAt: nowIso(),
      });
    } else if (est.costPerOrder > (getCostSettings().defaultShippingFeePerOrder || Infinity)) {
      suggestions.push({
        id: "cost-high",
        type: "cost",
        title: "Chi phí mỗi đơn cao",
        message: `Chi phí trung bình mỗi đơn là ${est.costPerOrder}. Xem lại tuyến hoặc phí ship.`,
        severity: "warning",
        actionLabel: "Xem chi phí",
        actionHref: "/route-planner",
        createdAt: nowIso(),
      });
    }
  }

  // Customer suggestions
  suggestions.push(...generateCustomerSuggestions(customers));

  // If nothing critical, show positive suggestion
  if (!suggestions.some((s) => s.severity === "warning" || s.severity === "danger")) {
    suggestions.unshift({
      id: "all-good",
      type: "success",
      title: "Tình trạng tuyến ổn",
      message: "Dữ liệu tuyến hiện tại khá ổn. Bạn có thể bắt đầu giao hoặc lưu tuyến vào lịch sử sau khi hoàn thành.",
      severity: "success",
      actionLabel: "Xem tuyến",
      actionHref: "/route-planner",
      createdAt: nowIso(),
    });
  }

  // Sort by severity (danger -> warning -> info -> success)
  const severityRank = (s: SmartSuggestion) => {
    switch (s.severity) {
      case "danger":
        return 0;
      case "warning":
        return 1;
      case "info":
        return 2;
      case "success":
        return 3;
      default:
        return 4;
    }
  };

  return suggestions.sort((a, b) => severityRank(a) - severityRank(b));
};
