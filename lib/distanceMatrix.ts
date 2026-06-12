/**
 * Google Distance Matrix API helper - calculate distances and durations between route points.
 * Used for optimizing delivery route order based on actual travel distances/times.
 */

import { RoutePoint, StartPoint } from "./types";

export interface DistanceMatrixCell {
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  distanceMeters: number;
  durationSeconds: number;
  distanceText: string;
  durationText: string;
  status: string;
}

export interface DistanceMatrixSummary {
  cells: DistanceMatrixCell[];
  totalDistanceMeters?: number;
  totalDurationSeconds?: number;
  validCellCount: number;
  totalCellCount: number;
}

/**
 * Validate route points have valid coordinates
 */
export const validateMatrixPoints = (
  startPoint: StartPoint | undefined,
  routePoints: RoutePoint[]
): { valid: boolean; message?: string } => {
  if (routePoints.length < 2) {
    return { valid: false, message: "Cần ít nhất 2 điểm giao hàng để tính Distance Matrix" };
  }

  // Check start point if provided
  if (startPoint && (!startPoint.lat || !startPoint.lng)) {
    return { valid: false, message: "Điểm bắt đầu chưa có tọa độ hợp lệ" };
  }

  // Check all route points have coordinates
  for (const point of routePoints) {
    if (!point.lat || !point.lng) {
      return {
        valid: false,
        message: `Điểm ${point.sequence} "${point.customerName}" chưa có tọa độ hợp lệ`,
      };
    }
  }

  return { valid: true };
};

/**
 * Format distance in meters to human-readable string
 */
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
};

/**
 * Format duration in seconds to human-readable string
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
 * Build list of all origins and destinations for Distance Matrix request
 */
const buildMatrixLocations = (
  startPoint: StartPoint | undefined,
  routePoints: RoutePoint[]
): Array<{ id: string; name: string; lat: number; lng: number }> => {
  const locations: Array<{ id: string; name: string; lat: number; lng: number }> = [];

  // Add start point if available
  if (startPoint && startPoint.lat && startPoint.lng) {
    locations.push({
      id: "start",
      name: startPoint.name || "Điểm bắt đầu",
      lat: startPoint.lat,
      lng: startPoint.lng,
    });
  }

  // Add route points
  for (const point of routePoints) {
    if (point.lat && point.lng) {
      locations.push({
        id: point.orderId,
        name: point.customerName,
        lat: point.lat,
        lng: point.lng,
      });
    }
  }

  return locations;
};

/**
 * Call Google Distance Matrix API
 * Returns distance and duration between all pairs of origins and destinations
 */
export const calculateDistanceMatrix = async (
  startPoint: StartPoint | undefined,
  routePoints: RoutePoint[],
  apiKey: string
): Promise<DistanceMatrixSummary> => {
  if (typeof google === "undefined" || !google.maps) {
    throw new Error("Google Maps API chưa tải");
  }

  if (!apiKey || apiKey === "your_google_maps_api_key_here") {
    throw new Error("Chưa cấu hình Google Maps API key.");
  }

  // Validate inputs
  const validation = validateMatrixPoints(startPoint, routePoints);
  if (!validation.valid) {
    throw new Error(validation.message || "Điểm giao không hợp lệ");
  }

  const locations = buildMatrixLocations(startPoint, routePoints);
  if (locations.length < 2) {
    throw new Error("Cần ít nhất 2 điểm có tọa độ để tính khoảng cách");
  }

  // Build origins and destinations
  // For simplicity, we treat all locations as both origins and destinations
  // This allows calculating distance from any point to any other point
  const origins = locations.map((loc) => ({ lat: loc.lat, lng: loc.lng }));
  const destinations = locations.map((loc) => ({ lat: loc.lat, lng: loc.lng }));

  const service = new google.maps.DistanceMatrixService();

  return new Promise((resolve, reject) => {
    service.getDistanceMatrix(
      {
        origins,
        destinations,
        travelMode: "DRIVING" as const,
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response: unknown, status: unknown) => {
        if (status !== "OK" || !response) {
          if (status === "ZERO_RESULTS") {
            reject(
              new Error("Không tìm thấy tuyến đi cho một số cặp điểm giao")
            );
          } else if (status === "OVER_QUERY_LIMIT") {
            reject(
              new Error(
                "Google Distance Matrix API đang bị giới hạn, vui lòng thử lại sau"
              )
            );
          } else if (status === "REQUEST_DENIED") {
            reject(
              new Error(
                "Không thể truy cập Google Distance Matrix API. Hãy kiểm tra API key và bật Distance Matrix API"
              )
            );
          } else if (status === "INVALID_REQUEST") {
            reject(
              new Error("Yêu cầu không hợp lệ: có thể quá nhiều điểm giao")
            );
          } else {
            reject(new Error(`Google Distance Matrix API lỗi: ${status}`));
          }
          return;
        }

        try {
          const responseObj = response as Record<string, unknown>;
          const rows = (responseObj.rows || []) as Array<Record<string, unknown>>;
          const cells: DistanceMatrixCell[] = [];
          let totalDistance = 0;
          let totalDuration = 0;
          let validCount = 0;

          rows.forEach((row, originIdx) => {
            const elements = (row.elements || []) as Array<Record<string, unknown>>;
            elements.forEach((element, destIdx) => {
              const fromLoc = locations[originIdx];
              const toLoc = locations[destIdx];

              if (!fromLoc || !toLoc) return;

              // Skip same-point pairs
              if (fromLoc.id === toLoc.id) return;

              const elemStatus = (element.status as string) || "UNKNOWN";
              let distance = 0;
              let duration = 0;
              let distanceText = "N/A";
              let durationText = "N/A";

              const dist = element.distance as Record<string, unknown> | undefined;
              const dur = element.duration as Record<string, unknown> | undefined;

              if (elemStatus === "OK" && dist && dur) {
                distance = (dist.value as number) || 0;
                duration = (dur.value as number) || 0;
                distanceText = (dist.text as string) || "N/A";
                durationText = (dur.text as string) || "N/A";
                totalDistance += distance;
                totalDuration += duration;
                validCount++;
              }

              cells.push({
                fromId: fromLoc.id,
                toId: toLoc.id,
                fromName: fromLoc.name,
                toName: toLoc.name,
                distanceMeters: distance,
                durationSeconds: duration,
                distanceText,
                durationText,
                status: elemStatus,
              });
            });
          });

          resolve({
            cells,
            totalDistanceMeters: validCount > 0 ? totalDistance : undefined,
            totalDurationSeconds: validCount > 0 ? totalDuration : undefined,
            validCellCount: validCount,
            totalCellCount: cells.length,
          });
        } catch (error) {
          reject(
            new Error(
              `Lỗi phân tích kết quả Distance Matrix: ${
                error instanceof Error ? error.message : "unknown"
              }`
            )
          );
        }
      }
    );
  });
};

/**
 * Get distance/duration between two specific points from matrix
 */
export const getMatrixCell = (
  matrix: DistanceMatrixSummary,
  fromId: string,
  toId: string
): DistanceMatrixCell | undefined => {
  return matrix.cells.find((cell) => cell.fromId === fromId && cell.toId === toId);
};

/**
 * Calculate total distance/duration for a given route sequence
 */
export const calculateRouteTotalsFromMatrix = (
  matrix: DistanceMatrixSummary,
  startPointId: string | undefined,
  routePointIds: string[]
): { totalDistance: number; totalDuration: number; totalDistanceText: string; totalDurationText: string } => {
  let totalDistance = 0;
  let totalDuration = 0;

  // Route starting from start point
  let currentId = startPointId || routePointIds[0];

  for (let i = 0; i < routePointIds.length; i++) {
    const nextId = routePointIds[i];

    if (currentId === nextId) {
      // Skip if same point
      continue;
    }

    const cell = getMatrixCell(matrix, currentId, nextId);
    if (cell && cell.status === "OK") {
      totalDistance += cell.distanceMeters;
      totalDuration += cell.durationSeconds;
    }

    currentId = nextId;
  }

  return {
    totalDistance,
    totalDuration,
    totalDistanceText: formatDistance(totalDistance),
    totalDurationText: formatDuration(totalDuration),
  };
};
