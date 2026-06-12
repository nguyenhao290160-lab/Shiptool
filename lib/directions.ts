/**
 * Google Directions API helper - draw actual routes on Google Maps.
 * Uses DirectionsService to calculate and render routes.
 */

import { RoutePoint, StartPoint } from "./types";

export interface DirectionsLeg {
  start: string;
  end: string;
  distance: string;
  duration: string;
  distanceValue: number; // in meters
  durationValue: number; // in seconds
}

export interface DirectionsResult {
  totalDistance: string; // formatted like "18.4 km"
  totalDistanceValue: number; // in meters
  totalDuration: string; // formatted like "42 mins"
  totalDurationValue: number; // in seconds
  legs: DirectionsLeg[];
  polyline?: string; // encoded polyline for the route
}

/**
 * Build a DirectionsRequest with origin, destination, and waypoints.
 */
export const buildDirectionsRequest = (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  waypoints: { lat: number; lng: number }[] = []
) => {
  return {
    origin,
    destination,
    waypoints: waypoints.map((wp) => ({ location: wp, stopover: true })),
    travelMode: "DRIVING" as const,
    unitSystem: 1, // METRIC
  };
};

/**
 * Calculate route using Google Directions API via JavaScript API.
 * Assumes google.maps is already loaded.
 */
export const calculateRouteDirections = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  waypoints: { lat: number; lng: number }[] = []
): Promise<DirectionsResult> => {
  if (typeof google === "undefined" || !google.maps) {
    throw new Error("Google Maps API chưa tải");
  }

  const directionsService = new google.maps.DirectionsService();
  const request = buildDirectionsRequest(origin, destination, waypoints);

  return new Promise((resolve, reject) => {
    directionsService.route(request, (result: unknown, status: unknown) => {
      if (status !== "OK" || !result) {
        if (status === "ZERO_RESULTS") {
          reject(new Error("Không tìm thấy tuyến đường cho điểm bắt đầu và kết thúc"));
        } else if (status === "OVER_QUERY_LIMIT") {
          reject(new Error("Google Directions API đang bị giới hạn, vui lòng thử lại sau"));
        } else if (status === "REQUEST_DENIED") {
          reject(
            new Error(
              "Không thể truy cập Google Directions API. Hãy kiểm tra API key và bật Directions API"
            )
          );
        } else if (status === "INVALID_REQUEST") {
          reject(new Error("Yêu cầu không hợp lệ: các điểm có thể quá xa hoặc không hợp lệ"));
        } else {
          reject(new Error(`Google Directions API lỗi: ${status}`));
        }
        return;
      }

      try {
        const resultObj = result as Record<string, Array<Record<string, unknown>>>;
        const route = resultObj.routes?.[0] as Record<string, unknown> | undefined;
        if (!route) throw new Error("Không tìm thấy tuyến đường trong kết quả");

        const legs = (route.legs || []) as Array<Record<string, unknown>>;

        const parsedLegs: DirectionsLeg[] = legs.map((leg, idx) => {
          const start = (leg.start_address as string) || `Điểm ${idx}`;
          const end = (leg.end_address as string) || `Điểm ${idx + 1}`;
          const distance = leg.distance as Record<string, unknown> | undefined;
          const duration = leg.duration as Record<string, unknown> | undefined;

          return {
            start,
            end,
            distance: (distance?.text as string) || "N/A",
            duration: (duration?.text as string) || "N/A",
            distanceValue: (distance?.value as number) || 0,
            durationValue: (duration?.value as number) || 0,
          };
        });

        // Calculate totals
        const totalDistanceValue = legs.reduce((sum, leg) => {
          const distance = leg.distance as Record<string, unknown> | undefined;
          return sum + ((distance?.value as number) || 0);
        }, 0);
        const totalDurationValue = legs.reduce((sum, leg) => {
          const duration = leg.duration as Record<string, unknown> | undefined;
          return sum + ((duration?.value as number) || 0);
        }, 0);

        // Format totals (distance in km, duration in mins/hours)
        const totalDistance =
          totalDistanceValue > 1000
            ? `${(totalDistanceValue / 1000).toFixed(1)} km`
            : `${totalDistanceValue.toFixed(0)} m`;

        const totalDurationMinutes = Math.round(totalDurationValue / 60);
        const totalDuration =
          totalDurationMinutes >= 60
            ? `${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}m`
            : `${totalDurationMinutes} phút`;

        // Get polyline if available
        const overview = route.overview_polyline as Record<string, unknown> | undefined;
        const polyline = (overview?.points as string) || undefined;

        resolve({
          totalDistance,
          totalDistanceValue,
          totalDuration,
          totalDurationValue,
          legs: parsedLegs,
          polyline,
        });
      } catch (error) {
        reject(new Error(`Lỗi phân tích kết quả: ${error instanceof Error ? error.message : "unknown"}`));
      }
    });
  });
};

/**
 * Render directions polyline on Google Map
 */
export const renderDirectionsPolyline = (
  map: unknown,
  polyline: string
): unknown | null => {
  if (typeof google === "undefined" || !google.maps || !polyline) {
    return null;
  }

  const poly = new google.maps.Polyline({
    path: google.maps.geometry.encoding.decodePath(polyline),
    geodesic: true,
    strokeColor: "#0891b2", // cyan-600
    strokeOpacity: 0.8,
    strokeWeight: 4,
    map: map as unknown as typeof google.maps.Map,
  });

  return poly;
};

/**
 * Format duration seconds to human readable string
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  return `${minutes} phút`;
};

/**
 * Format distance meters to human readable string
 */
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
};

/**
 * Extract origin and waypoints from route points
 */
export const extractRouteWaypoints = (
  startPoint: StartPoint | undefined,
  routePoints: RoutePoint[]
) => {
  // Start point (origin)
  const origin = startPoint
    ? { lat: startPoint.lat || 0, lng: startPoint.lng || 0 }
    : routePoints.length > 0
      ? { lat: routePoints[0].lat || 0, lng: routePoints[0].lng || 0 }
      : null;

  // Destination (last point)
  const destination =
    routePoints.length > 0
      ? { lat: routePoints[routePoints.length - 1].lat || 0, lng: routePoints[routePoints.length - 1].lng || 0 }
      : null;

  // Waypoints (middle points)
  const waypoints =
    routePoints.length > 2
      ? routePoints.slice(1, -1).map((p) => ({ lat: p.lat || 0, lng: p.lng || 0 }))
      : [];

  return { origin, destination, waypoints };
};

/**
 * Validate that all points have valid coordinates
 */
export const validateRouteCoordinates = (
  startPoint: StartPoint | undefined,
  routePoints: RoutePoint[]
): { valid: boolean; message?: string } => {
  // Need at least 2 points total
  if (routePoints.length < 2) {
    return { valid: false, message: "Cần ít nhất 2 điểm giao hàng có tọa độ" };
  }

  // Check if start point has coordinates if provided
  if (startPoint && (!startPoint.lat || !startPoint.lng)) {
    return { valid: false, message: "Điểm bắt đầu chưa có tọa độ" };
  }

  // Check if all route points have coordinates
  for (const point of routePoints) {
    if (!point.lat || !point.lng) {
      return {
        valid: false,
        message: `Điểm ${point.sequence} "${point.customerName}" chưa có tọa độ`,
      };
    }
  }

  return { valid: true };
};
