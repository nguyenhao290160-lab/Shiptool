export interface OrderStop {
  id: string;
  label: string; // Khách 1, Khách 2, etc.
  receiverName?: string;
  phone?: string;
  address: string;
  note?: string;
  codAmount?: number;
  status: DeliveryStatus | "skipped";
  createdAt: string;
  updatedAt: string;
  // Proof / delivery metadata (optional)
  deliveredAt?: string;
  failedAt?: string;
  deliveryNote?: string;
  failureReason?: string;
  recipientName?: string;
}

export interface RoutePlan {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  startAddress?: string;
  currentStopIndex: number;
  stops: OrderStop[];
  status: "draft" | "delivering" | "completed";
}

// ── Delivery Order Manager (Prompt 2) ──────────────────────────────

export type DeliveryStatus =
  | "pending"
  | "ready"
  | "assigned"
  | "delivering"
  | "delivered"
  | "failed"
  | "cancelled";

export type DeliveryPriority = "low" | "normal" | "high";

export interface DeliveryOrder {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  note: string;
  status: DeliveryStatus;
  priority: DeliveryPriority;
  /** Latitude – can be set manually or via geocoding */
  lat?: number;
  /** Longitude – can be set manually or via geocoding */
  lng?: number;
  /** Formatted address from geocoding API */
  geocodedAddress?: string;
  /** Place ID from Google geocoding */
  placeId?: string;
  /** Geocoding status: idle, loading, success, error */
  geocodingStatus?: "idle" | "loading" | "success" | "error";
  /** Geocoding error message if any */
  geocodingError?: string;
  createdAt: string;
  updatedAt: string;
  deliveryWindow?: string;
  // Proof fields
  deliveredAt?: string;
  failedAt?: string;
  deliveryNote?: string;
  failureReason?: string;
  recipientName?: string;
}

// ── Route Planner (Prompt 3) ────────────────────────────────────────

export interface StartPoint {
  name: string;
  address: string;
  lat?: number;
  lng?: number;
}

export interface RoutePoint {
  orderId: string;
  sequence: number;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  status: DeliveryStatus;
  priority: DeliveryPriority;
  lat?: number;
  lng?: number;
  deliveredAt?: string;
  failedAt?: string;
}

export interface DeliveryRoutePlan {
  id: string;
  name: string;
  startPoint?: StartPoint;
  points: RoutePoint[];
  createdAt: string;
  updatedAt: string;
  routingMode?: "google" | "local-fallback" | "manual";
}

// ── Route History (Prompt 14) ───────────────────────────────────────

export interface RouteHistoryPoint {
  orderId: string;
  sequence: number;
  customerName: string;
  phone?: string;
  address: string;
  status: string;
  priority?: string;
  lat?: number;
  lng?: number;
  note?: string;
  deliveredAt?: string;
  failedAt?: string;
}

export interface RouteHistoryItem {
  id: string;
  name: string;
  date: string; // ISO
  status: "draft" | "in_progress" | "completed" | "cancelled";
  startPoint?: {
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  points: RouteHistoryPoint[];
  totalOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  cancelledOrders: number;
  totalDistanceMeters?: number;
  totalDurationSeconds?: number;
  distanceText?: string;
  durationText?: string;
  optimizedBy?: "google" | "local-fallback" | "manual" | "local" | "distance_matrix";
  note?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  costEstimate?: RouteCostEstimate; // Operating cost snapshot (Prompt 15)
}

// ── Map View (Prompt 4) ─────────────────────────────────────────────

export type GoogleMapLoadStatus =
  | "missing-api-key"
  | "loading"
  | "ready"
  | "error"
  | "offline";

export interface MapDeliveryMarker {
  id: string;
  sequence?: number;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  status: DeliveryStatus;
  priority: DeliveryPriority;
  lat: number;
  lng: number;
}

// ── Operating Cost (Prompt 15) ───────────────────────────────────────

export interface OperatingCostSettings {
  fuelPricePerLiter: number;
  fuelConsumptionPer100Km: number;
  maintenanceCostPerKm?: number;
  otherCostPerRoute?: number;
  defaultShippingFeePerOrder?: number;
  currency: "VND";
  updatedAt: string;
}

export interface RouteCostEstimate {
  routeId?: string;
  totalDistanceKm: number;
  totalOrders: number;
  fuelLiters: number;
  fuelCost: number;
  maintenanceCost: number;
  otherCost: number;
  totalOperatingCost: number;
  estimatedRevenue: number;
  estimatedProfit: number;
  costPerOrder: number;
  revenuePerOrder: number;
  profitPerOrder: number;
  calculatedAt: string;
}

// ── Frequent Customer (Prompt 16A) ───────────────────────────────────

export interface FrequentCustomer {
  id: string;
  name: string;
  phone?: string;
  address: string;
  note?: string;
  lat?: number;
  lng?: number;
  geocodedAddress?: string;
  placeId?: string;
  totalOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  cancelledOrders: number;
  lastOrderAt?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
