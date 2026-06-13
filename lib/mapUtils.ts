import {
  DeliveryOrder,
  DeliveryRoutePlan,
  MapDeliveryMarker,
  GoogleMapLoadStatus,
} from "./types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace google {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace maps {
      class Map {
        constructor(element: HTMLElement, options?: Record<string, unknown>);
        setCenter(center: LatLng | { lat: number; lng: number }): void;
        setZoom(zoom: number): void;
        fitBounds(bounds: LatLngBounds, padding?: number): void;
      }
      class Marker {
        constructor(options?: Record<string, unknown>);
        setMap(map: Map | null): void;
        setPosition(position: LatLng): void;
      }
      class Polyline {
        constructor(options?: Record<string, unknown>);
        setMap(map: Map | null): void;
        setPath(path: LatLng[]): void;
      }
      class LatLngBounds {
        constructor(sw?: LatLng, ne?: LatLng);
        extend(point: LatLng | { lat: number; lng: number }): void;
      }
      class LatLng {
        constructor(lat: number, lng: number);
      }
      class DirectionsService {
        constructor();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        route(request: Record<string, unknown>, callback: Function): void;
      }
      class DirectionsRenderer {
        constructor(options?: Record<string, unknown>);
        setMap(map: Map | null): void;
        setDirections(directions: Record<string, unknown>): void;
      }
      class DistanceMatrixService {
        constructor();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        getDistanceMatrix(request: Record<string, unknown>, callback: Function): void;
      }
      enum UnitSystem {
        METRIC,
        IMPERIAL,
      }
      // eslint-disable-next-line @typescript-eslint/no-namespace
      namespace event {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        function addListener(instance: unknown, eventName: string, handler: Function): void;
      }
      // eslint-disable-next-line @typescript-eslint/no-namespace
      namespace geometry {
        // eslint-disable-next-line @typescript-eslint/no-namespace
        namespace encoding {
          function decodePath(path: string): Array<{ lat: number; lng: number }>;
          function encodePath(path: LatLng[]): string;
        }
      }
      enum MapTypeId {
        ROADMAP,
        SATELLITE,
        HYBRID,
        TERRAIN
      }
    }
  }
}

// ── Google Maps API key ─────────────────────────────────────────────

export const getGoogleMapsApiKey = (): string | undefined => {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || undefined;
};

export const hasApiKey = (): boolean => {
  const key = getGoogleMapsApiKey();
  return !!key && key !== "your_google_maps_api_key_here";
};

// ── Online/Offline check ────────────────────────────────────────────

export const isOnline = (): boolean => {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
};

// ── Coordinate Validation Helpers ────────────────────────────────────

/**
 * Validate latitude is a number between -90 and 90.
 */
export const validateLatitude = (lat: unknown): boolean => {
  if (lat === null || lat === undefined || lat === "") return false;
  const num = typeof lat === "number" ? lat : parseFloat(String(lat));
  return !isNaN(num) && num >= -90 && num <= 90;
};

/**
 * Validate longitude is a number between -180 and 180.
 */
export const validateLongitude = (lng: unknown): boolean => {
  if (lng === null || lng === undefined || lng === "") return false;
  const num = typeof lng === "number" ? lng : parseFloat(String(lng));
  return !isNaN(num) && num >= -180 && num <= 180;
};

/**
 * Validate coordinate pair is within acceptable GPS boundaries.
 */
export const validateCoordinates = (lat: unknown, lng: unknown): boolean => {
  return validateLatitude(lat) && validateLongitude(lng);
};

// ── Default map center (Ho Chi Minh City) ───────────────────────────

export const DEFAULT_CENTER = { lat: 10.7769, lng: 106.7009 };
export const DEFAULT_ZOOM = 12;

// ── Determine initial load status ───────────────────────────────────

export const getInitialMapStatus = (): GoogleMapLoadStatus => {
  if (!hasApiKey()) return "missing-api-key";
  if (!isOnline()) return "offline";
  return "loading";
};

// ── Google Maps Script Loader ───────────────────────────────────────

const SCRIPT_ID = "google-maps-script";

/**
 * Load the Google Maps JavaScript API script dynamically.
 * Returns a promise that resolves when the script has loaded,
 * or rejects on error/timeout.
 */
export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // SSR safety
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    // Already loaded
    if (typeof google !== "undefined" && google.maps) {
      resolve();
      return;
    }

    // Check offline state early
    if (!isOnline()) {
      reject(new Error("OFFLINE: Không có kết nối mạng để tải bản đồ"));
      return;
    }

    // Already loading (another call in progress)
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("GOOGLE_MAPS_SCRIPT_LOAD_FAILED: Lỗi tải script Google Maps"))
      );
      return;
    }

    const key = getGoogleMapsApiKey();
    if (!key) {
      reject(new Error("MISSING_API_KEY: Chưa cấu hình Google Maps API key"));
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=marker,geometry&v=weekly`;
    script.async = true;
    script.defer = true;

    // Timeout after 15 seconds
    const timeout = setTimeout(() => {
      reject(new Error("GOOGLE_MAPS_SCRIPT_LOAD_TIMED_OUT: Hết thời gian chờ tải bản đồ (15 giây)"));
    }, 15000);

    script.addEventListener("load", () => {
      clearTimeout(timeout);
      resolve();
    });

    script.addEventListener("error", () => {
      clearTimeout(timeout);
      reject(new Error("GOOGLE_MAPS_SCRIPT_LOAD_FAILED: Không thể tải được script bản đồ. Vui lòng kiểm tra lại mạng hoặc API Key."));
    });

    document.head.appendChild(script);
  });
};

// ── Build marker data from orders + route plan ──────────────────────

/**
 * Builds MapDeliveryMarker[] by merging DeliveryOrder data with
 * optional route plan sequence numbers.
 * Only includes orders that have lat AND lng.
 */
export const buildMarkerData = (
  orders: DeliveryOrder[],
  routePlan: DeliveryRoutePlan | null
): MapDeliveryMarker[] => {
  // If route plan exists, prefer its order and sequence numbers
  if (routePlan && routePlan.points.length > 0) {
    return routePlan.points
      .filter((p) => p.lat != null && p.lng != null)
      .map((p) => ({
        id: p.orderId,
        sequence: p.sequence,
        customerName: p.customerName,
        phone: p.phone,
        address: p.address,
        note: p.note,
        status: p.status,
        priority: p.priority,
        lat: p.lat!,
        lng: p.lng!,
      }));
  }

  // Fallback: use delivery orders directly
  return orders
    .filter((o) => o.lat != null && o.lng != null)
    .map((o, idx) => ({
      id: o.id,
      sequence: idx + 1,
      customerName: o.customerName,
      phone: o.phone,
      address: o.address,
      note: o.note || undefined,
      status: o.status,
      priority: o.priority,
      lat: o.lat!,
      lng: o.lng!,
    }));
};

// ── Fit bounds helper ───────────────────────────────────────────────

export const fitMapBounds = (
  map: google.maps.Map,
  markers: MapDeliveryMarker[]
): void => {
  if (markers.length === 0) return;

  if (markers.length === 1) {
    map.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
    map.setZoom(15);
    return;
  }

  const bounds = new google.maps.LatLngBounds();
  markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
  map.fitBounds(bounds, 60); // 60px padding
};

// ── Status label helpers ────────────────────────────────────────────

export const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ giao",
  delivering: "Đang giao",
  delivered: "Đã giao",
  failed: "Thất bại",
  cancelled: "Đã hủy",
};

export const PRIORITY_LABELS: Record<string, string> = {
  high: "Cao",
  normal: "Bình thường",
  low: "Thấp",
};

// ── Marker color by status ──────────────────────────────────────────

export const MARKER_COLORS: Record<string, string> = {
  pending: "#f59e0b",    // amber
  delivering: "#06b6d4", // cyan
  delivered: "#10b981",  // emerald
  failed: "#ef4444",     // red
  cancelled: "#94a3b8",  // slate
};
