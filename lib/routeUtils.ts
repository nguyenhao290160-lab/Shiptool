import { RoutePoint } from "./types";

// ── Haversine distance (km) ─────────────────────────────────────────

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Calculate the great-circle distance between two lat/lng points.
 * Returns distance in kilometres.
 */
export const haversine = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── Total distance for an ordered list of points ────────────────────

export const totalRouteDistanceKm = (
  points: RoutePoint[],
  startLat?: number,
  startLng?: number
): number | null => {
  const withCoords = points.filter(
    (p) => p.lat != null && p.lng != null
  );
  if (withCoords.length < 2) return null;

  let total = 0;

  // If start point has coords, include distance to first point
  if (startLat != null && startLng != null && withCoords.length > 0) {
    total += haversine(startLat, startLng, withCoords[0].lat!, withCoords[0].lng!);
  }

  for (let i = 0; i < withCoords.length - 1; i++) {
    total += haversine(
      withCoords[i].lat!,
      withCoords[i].lng!,
      withCoords[i + 1].lat!,
      withCoords[i + 1].lng!
    );
  }
  return Math.round(total * 100) / 100; // 2 decimal places
};

// ── Nearest-neighbour sort (greedy) ─────────────────────────────────

/**
 * Re-order points using nearest-neighbour heuristic.
 * Only works if ALL points have lat/lng. If any point is missing coords,
 * returns null to signal fallback sort should be used.
 */
export const nearestNeighbourSort = (
  points: RoutePoint[],
  startLat?: number,
  startLng?: number
): RoutePoint[] | null => {
  if (points.length <= 1) return points;

  // Check that all points have coords
  const allHaveCoords = points.every(
    (p) => p.lat != null && p.lng != null
  );
  if (!allHaveCoords) return null;

  const remaining = [...points];
  const sorted: RoutePoint[] = [];

  // Starting reference
  let curLat = startLat ?? remaining[0].lat!;
  let curLng = startLng ?? remaining[0].lng!;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(curLat, curLng, remaining[i].lat!, remaining[i].lng!);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }

    const next = remaining.splice(nearestIdx, 1)[0];
    sorted.push(next);
    curLat = next.lat!;
    curLng = next.lng!;
  }

  // Re-assign sequence numbers
  return sorted.map((p, i) => ({ ...p, sequence: i + 1 }));
};

// ── Fallback sort (priority → status → createdAt) ───────────────────

const PRIORITY_WEIGHT: Record<string, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

const STATUS_WEIGHT: Record<string, number> = {
  delivering: 0,
  pending: 1,
};

export const fallbackSort = (points: RoutePoint[]): RoutePoint[] => {
  const sorted = [...points].sort((a, b) => {
    // 1. Priority: high → normal → low
    const prioDiff =
      (PRIORITY_WEIGHT[a.priority] ?? 9) -
      (PRIORITY_WEIGHT[b.priority] ?? 9);
    if (prioDiff !== 0) return prioDiff;

    // 2. Status: delivering → pending
    const statusDiff =
      (STATUS_WEIGHT[a.status] ?? 9) -
      (STATUS_WEIGHT[b.status] ?? 9);
    if (statusDiff !== 0) return statusDiff;

    // 3. CreatedAt: older first (ascending)
    // RoutePoint doesn't have createdAt, but orderId for demo data is timestamp-based
    return a.orderId.localeCompare(b.orderId);
  });

  return sorted.map((p, i) => ({ ...p, sequence: i + 1 }));
};

// ── Count helpers ───────────────────────────────────────────────────

export const countMissingCoords = (points: RoutePoint[]): number =>
  points.filter((p) => p.lat == null || p.lng == null).length;

export const countHighPriority = (points: RoutePoint[]): number =>
  points.filter((p) => p.priority === "high").length;

export const hasAnyCoords = (points: RoutePoint[]): boolean =>
  points.some((p) => p.lat != null && p.lng != null);

export const hasAllCoords = (points: RoutePoint[]): boolean =>
  points.length > 0 && points.every((p) => p.lat != null && p.lng != null);
