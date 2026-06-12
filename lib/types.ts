export interface OrderStop {
  id: string;
  label: string; // Khách 1, Khách 2, etc.
  receiverName?: string;
  phone?: string;
  address: string;
  note?: string;
  codAmount?: number;
  status: "pending" | "delivered" | "skipped";
  createdAt: string;
  updatedAt: string;
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
}

export interface DeliveryRoutePlan {
  id: string;
  name: string;
  startPoint?: StartPoint;
  points: RoutePoint[];
  createdAt: string;
  updatedAt: string;
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
