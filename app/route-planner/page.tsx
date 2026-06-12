"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DeliveryOrder,
  DeliveryRoutePlan,
  RoutePoint,
  StartPoint,
} from "@/lib/types";
import { getDeliveryOrders, seedDemoOrdersIfEmpty } from "@/lib/deliveryStorage";
import { getRoutePlan, saveRoutePlan, deleteRoutePlan } from "@/lib/routeStorage";
import {
  nearestNeighbourSort,
  fallbackSort,
  hasAllCoords,
  hasAnyCoords,
} from "@/lib/routeUtils";
import {
  calculateRouteDirections,
  DirectionsResult,
  extractRouteWaypoints,
  validateRouteCoordinates,
} from "@/lib/directions";
import {
  calculateDistanceMatrix,
  calculateRouteTotalsFromMatrix,
  getMatrixCell,
} from "@/lib/distanceMatrix";
import { isOnline, loadGoogleMapsScript } from "@/lib/mapUtils";
import { RoutePointCard } from "@/components/RoutePointCard";
import { RouteStats } from "@/components/RouteStats";
import { DirectionsPanel } from "@/components/DirectionsPanel";
import { DistanceMatrixSummary } from "@/lib/distanceMatrix";

// ── Helper: convert DeliveryOrder → RoutePoint ──────────────────────

const orderToPoint = (
  order: DeliveryOrder,
  seq: number
): RoutePoint => ({
  orderId: order.id,
  sequence: seq,
  customerName: order.customerName,
  phone: order.phone,
  address: order.address,
  note: order.note || undefined,
  status: order.status,
  priority: order.priority,
  lat: order.lat,
  lng: order.lng,
});

// ── Helper: optimize route using Distance Matrix ─────────────────────

const optimizeRouteWithMatrix = (
  points: RoutePoint[],
  matrix: DistanceMatrixSummary,
  startPointId: string
): RoutePoint[] => {
  if (points.length === 0) return points;
  if (points.length === 1) return points;

  const remaining = [...points];
  const optimized: RoutePoint[] = [];
  let currentId = startPointId;

  // Nearest neighbor algorithm based on duration/distance
  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const point = remaining[i];
      const cell = getMatrixCell(matrix, currentId, point.orderId);

      // Calculate score: prioritize high priority, then shorter duration/distance
      let score = Infinity;

      if (cell && cell.status === "OK") {
        // Base score: duration (seconds)
        score = cell.durationSeconds;

        // Penalize low priority orders (multiply by 2 to deprioritize)
        if (point.priority === "low") {
          score *= 1.5;
        }

        // Boost high priority orders (divide to prioritize)
        if (point.priority === "high") {
          score *= 0.5;
        }

        // Slightly prefer delivering orders over pending
        if (point.status === "delivering" && currentId !== startPointId) {
          score *= 0.95;
        }
      }

      if (score < bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    // Add best point to optimized route
    const nextPoint = remaining.splice(bestIdx, 1)[0];
    if (nextPoint) {
      optimized.push({
        ...nextPoint,
        sequence: optimized.length + 1,
      });
      currentId = nextPoint.orderId;
    }
  }

  return optimized;
};

// ── Page ────────────────────────────────────────────────────────────

export default function RoutePlannerPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [plan, setPlan] = useState<DeliveryRoutePlan | null>(null);
  const [startName, setStartName] = useState("");
  const [startAddress, setStartAddress] = useState("");
  const [optimizeMsg, setOptimizeMsg] = useState("");
  const [hasExistingOrders, setHasExistingOrders] = useState(false);
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [directionsLoading, setDirectionsLoading] = useState(false);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const [distanceMatrixLoading, setDistanceMatrixLoading] = useState(false);
  const [distanceMatrixError, setDistanceMatrixError] = useState<string | null>(null);
  const [optimizeStats, setOptimizeStats] = useState<{
    before: { distance: string; duration: string };
    after: { distance: string; duration: string };
  } | null>(null);
  const polylineRef = useRef<unknown>(null);

  // ── Hydration-safe init ───────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      // Seed demo orders if none exist
      seedDemoOrdersIfEmpty();

      // Try to load saved route plan
      const saved = getRoutePlan();
      if (saved) {
        setPlan(saved);
        setStartName(saved.startPoint?.name ?? "");
        setStartAddress(saved.startPoint?.address ?? "");
      }

      // Check if there are eligible orders
      const orders = getDeliveryOrders();
      const eligible = orders.filter(
        (o) => o.status === "pending" || o.status === "delivering"
      );
      setHasExistingOrders(eligible.length > 0);

      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // ── Build route from current delivery orders ──────────────────────

  const buildRouteFromOrders = useCallback(() => {
    const orders = getDeliveryOrders();
    const eligible = orders.filter(
      (o) => o.status === "pending" || o.status === "delivering"
    );

    if (eligible.length === 0) {
      setOptimizeMsg("Chưa có đơn chờ giao để lập tuyến.");
      return;
    }

    const points = eligible.map((o, i) => orderToPoint(o, i + 1));

    // Apply initial fallback sort
    const sorted = fallbackSort(points);

    const startPoint: StartPoint | undefined =
      startName.trim() || startAddress.trim()
        ? {
            name: startName.trim() || "Điểm bắt đầu",
            address: startAddress.trim(),
          }
        : undefined;

    const now = new Date().toISOString();
    const newPlan: DeliveryRoutePlan = {
      id: Date.now().toString(),
      name: `Tuyến ngày ${new Date().toLocaleDateString("vi-VN")}`,
      startPoint,
      points: sorted,
      createdAt: now,
      updatedAt: now,
    };

    saveRoutePlan(newPlan);
    setPlan(newPlan);
    setHasExistingOrders(true);
    setOptimizeMsg(
      "Đã tạo tuyến từ đơn hiện có. Sắp xếp theo ưu tiên và trạng thái."
    );
  }, [startName, startAddress]);

  // ── Optimise route ────────────────────────────────────────────────

  const optimiseRoute = useCallback(() => {
    if (!plan || plan.points.length === 0) return;

    const allCoords = hasAllCoords(plan.points);

    if (allCoords) {
      const result = nearestNeighbourSort(
        plan.points,
        plan.startPoint?.lat,
        plan.startPoint?.lng
      );
      if (result) {
        const updated = { ...plan, points: result };
        saveRoutePlan(updated);
        setPlan(updated);
        setOptimizeMsg(
          "Đang dùng thuật toán local đơn giản để gợi ý thứ tự giao."
        );
        return;
      }
    }

    // Fallback
    const sorted = fallbackSort(plan.points);
    const updated = { ...plan, points: sorted };
    saveRoutePlan(updated);
    setPlan(updated);
    setOptimizeMsg(
      "Chưa có tọa độ, hệ thống đang sắp xếp theo ưu tiên và trạng thái. Prompt sau sẽ gắn Google Maps để tính tuyến chính xác hơn."
    );
  }, [plan]);

  // ── Optimize route with Distance Matrix ───────────────────────────

  const optimiseRouteWithDistanceMatrix = useCallback(async () => {
    if (!plan || plan.points.length < 2) {
      setDistanceMatrixError("Cần ít nhất 2 điểm để tối ưu bằng Distance Matrix.");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setDistanceMatrixError("Chưa cấu hình Google Maps API key.");
      return;
    }

    if (!isOnline()) {
      setDistanceMatrixError(
        "Bạn đang offline, không thể tối ưu bằng Google Distance Matrix."
      );
      return;
    }

    // Check if all points have coordinates
    const allCoords = hasAllCoords(plan.points);
    if (!allCoords) {
      setDistanceMatrixError("Có đơn chưa có tọa độ. Hãy dùng chức năng Lấy tọa độ trước.");
      return;
    }

    try {
      setDistanceMatrixLoading(true);
      setDistanceMatrixError(null);
      setOptimizeStats(null);

      // Ensure Google Maps script is loaded
      await loadGoogleMapsScript();

      // Calculate current route totals (before optimization)
      const beforeStats = calculateRouteTotalsFromMatrix(
        {
          cells: [],
          validCellCount: 0,
          totalCellCount: 0,
        },
        "start",
        plan.points.map((p) => p.orderId)
      );

      // Calculate Distance Matrix
      const matrix = await calculateDistanceMatrix(
        plan.startPoint,
        plan.points,
        apiKey
      );

      if (matrix.validCellCount === 0) {
        setDistanceMatrixError(
          "Không thể tính khoảng cách giữa các điểm giao. Google Distance Matrix API có thể đang lỗi hoặc bị giới hạn."
        );
        setDistanceMatrixLoading(false);
        return;
      }

      // Optimize route using nearest neighbor with Distance Matrix data
      const optimizedPoints = optimizeRouteWithMatrix(
        plan.points,
        matrix,
        "start"
      );

      // Calculate optimized route totals
      const afterStats = calculateRouteTotalsFromMatrix(
        matrix,
        "start",
        optimizedPoints.map((p) => p.orderId)
      );

      // Update plan with optimized points
      const now = new Date().toISOString();
      const updated: DeliveryRoutePlan = {
        ...plan,
        points: optimizedPoints,
        updatedAt: now,
      };

      saveRoutePlan(updated);
      setPlan(updated);

      // Set optimization stats for display
      setOptimizeStats({
        before: {
          distance: beforeStats.totalDistanceText,
          duration: beforeStats.totalDurationText,
        },
        after: {
          distance: afterStats.totalDistanceText,
          duration: afterStats.totalDurationText,
        },
      });

      setOptimizeMsg("Đã tối ưu tuyến bằng Google Distance Matrix!");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể tối ưu tuyến. Google Distance Matrix API có thể đang lỗi hoặc bị giới hạn.";
      setDistanceMatrixError(message);
    } finally {
      setDistanceMatrixLoading(false);
    }
  }, [plan]);

  // ── Reset order ───────────────────────────────────────────────────

  const resetOrder = useCallback(() => {
    if (!plan) return;
    const reset = plan.points.map((p, i) => ({ ...p, sequence: i + 1 }));
    // Re-apply fallback sort
    const sorted = fallbackSort(reset);
    const updated = { ...plan, points: sorted };
    saveRoutePlan(updated);
    setPlan(updated);
    setOptimizeMsg("Đã reset thứ tự về mặc định.");
  }, [plan]);

  // ── Delete route ──────────────────────────────────────────────────

  const handleDeleteRoute = useCallback(() => {
    if (!confirm("Bạn có chắc muốn xóa tuyến hiện tại?")) return;
    deleteRoutePlan();
    setPlan(null);
    setOptimizeMsg("");
  }, []);

  // ── Save route ────────────────────────────────────────────────────

  const handleSaveRoute = useCallback(() => {
    if (!plan) return;
    const startPoint: StartPoint | undefined =
      startName.trim() || startAddress.trim()
        ? {
            name: startName.trim() || "Điểm bắt đầu",
            address: startAddress.trim(),
          }
        : undefined;

    const updated = { ...plan, startPoint };
    saveRoutePlan(updated);
    setPlan(updated);
    setOptimizeMsg("Đã lưu tuyến thành công!");
  }, [plan, startName, startAddress]);

  // ── Move helpers ──────────────────────────────────────────────────

  const moveTo = (fromIdx: number, toIdx: number) => {
    if (!plan) return;
    const pts = [...plan.points];
    const [item] = pts.splice(fromIdx, 1);
    pts.splice(toIdx, 0, item);
    const reseq = pts.map((p, i) => ({ ...p, sequence: i + 1 }));
    const updated = { ...plan, points: reseq };
    saveRoutePlan(updated);
    setPlan(updated);
  };

  // ── Draw directions on map ────────────────────────────────────────

  const handleDrawDirections = useCallback(async () => {
    if (!plan || plan.points.length < 2) {
      setDirectionsError("Cần ít nhất 2 điểm để vẽ tuyến đường.");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setDirectionsError("Chưa cấu hình Google Maps API key.");
      return;
    }

    if (!isOnline()) {
      setDirectionsError("Bạn đang offline, không thể vẽ tuyến đường bằng Google Directions.");
      return;
    }

    // Validate all points have coordinates
    const validation = validateRouteCoordinates(plan.startPoint, plan.points);
    if (!validation.valid) {
      setDirectionsError(validation.message || "Một số điểm chưa có tọa độ.");
      return;
    }

    try {
      setDirectionsLoading(true);
      setDirectionsError(null);

      // Ensure Google Maps script is loaded
      await loadGoogleMapsScript();

      // Extract origin, destination, waypoints
      const { origin, destination, waypoints } = extractRouteWaypoints(plan.startPoint, plan.points);

      if (!origin || !destination) {
        setDirectionsError("Không thể xác định điểm bắt đầu hoặc kết thúc.");
        setDirectionsLoading(false);
        return;
      }

      // Calculate directions
      const result = await calculateRouteDirections(origin, destination, waypoints);

      setDirections(result);
      setDirectionsError(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể vẽ tuyến đường. Google Directions API có thể đang lỗi hoặc bị giới hạn.";
      setDirectionsError(message);
      setDirections(null);
    } finally {
      setDirectionsLoading(false);
    }
  }, [plan]);

  const handleRenderPolyline = useCallback(async () => {
    if (!directions || !directions.polyline) return;

    try {
      // Ensure Google Maps script is loaded
      await loadGoogleMapsScript();

      // For now, we're just storing the directions, as we don't have a live map instance
      // In a full implementation, you'd get the map from a MapView component
      // and then call: renderDirectionsPolyline(mapInstance, directions.polyline)
      console.log("Polyline ready:", directions.polyline);
    } catch (err) {
      console.error("Error rendering polyline:", err);
    }
  }, [directions]);

  const handleClearRoute = useCallback(() => {
    if (polylineRef.current) {
      const polyline = polylineRef.current as google.maps.Polyline;
      polyline.setMap(null);
      polylineRef.current = null;
    }
    setDirections(null);
    setDirectionsError(null);
  }, []);

  // ── SSR placeholder ───────────────────────────────────────────────

  if (!isMounted) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col max-w-3xl mx-auto">
        <div className="p-6" />
      </div>
    );
  }

  // ── Coordinate status message ─────────────────────────────────────

  const coordMsg = plan
    ? hasAllCoords(plan.points)
      ? {
          text: "Đang dùng thuật toán local đơn giản để gợi ý thứ tự giao.",
          cls: "bg-emerald-50 border-emerald-200 text-emerald-800",
          icon: "text-emerald-600",
        }
      : hasAnyCoords(plan.points)
        ? {
            text: "Một số điểm chưa có tọa độ. Hệ thống sắp xếp theo ưu tiên và trạng thái cho các điểm thiếu GPS.",
            cls: "bg-amber-50 border-amber-200 text-amber-800",
            icon: "text-amber-600",
          }
        : {
            text: "Chưa có tọa độ, hệ thống đang sắp xếp theo ưu tiên và trạng thái. Prompt sau sẽ gắn Google Maps để tính tuyến chính xác hơn.",
            cls: "bg-amber-50 border-amber-200 text-amber-800",
            icon: "text-amber-600",
          }
    : null;

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col max-w-3xl mx-auto shadow-xl">
      {/* ── Header ── */}
      <header className="bg-white sticky top-0 z-30 border-b border-slate-200 shadow-sm">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/home")}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Lập tuyến đường
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {plan
                  ? `${plan.points.length} điểm giao · ${plan.name}`
                  : "Tạo tuyến mới từ đơn giao"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 p-5 flex flex-col gap-5 pb-24">
        {/* ── Start point input ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-5 bg-cyan-500 rounded-full" />
            Điểm bắt đầu
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Tên
              </label>
              <input
                type="text"
                placeholder="VD: Kho hàng Q.7"
                className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-white focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                value={startName}
                onChange={(e) => setStartName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Địa chỉ
              </label>
              <input
                type="text"
                placeholder="VD: 100 Nguyễn Thị Thập, Q.7"
                className="w-full border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-white focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                value={startAddress}
                onChange={(e) => setStartAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={buildRouteFromOrders}
            disabled={!hasExistingOrders && !plan}
            className="bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo tuyến từ đơn
          </button>
          <button
            onClick={optimiseRoute}
            disabled={!plan || plan.points.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Tối ưu tuyến local
          </button>
          <button
            onClick={resetOrder}
            disabled={!plan || plan.points.length === 0}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset thứ tự
          </button>
          <button
            onClick={handleSaveRoute}
            disabled={!plan || plan.points.length === 0}
            className="bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Lưu tuyến
          </button>
        </div>

        {/* ── Distance Matrix Optimization button ── */}
        {plan && (
          <button
            onClick={optimiseRouteWithDistanceMatrix}
            disabled={distanceMatrixLoading || !hasAllCoords(plan.points)}
            className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-slate-400 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {distanceMatrixLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tối ưu...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19l-7-7 7-7m8 0a7 7 0 100 14 7 7 0 000-14z"
                  />
                </svg>
                Tối ưu bằng Google Distance Matrix
              </>
            )}
          </button>
        )}

        {/* ── API Quota Warning ── */}
        {plan && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-amber-600 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
              Tối ưu bằng Google Distance Matrix sử dụng Google API và có thể tính phí theo số lượt gọi. Hãy kiểm tra quota trong Google Cloud.
            </p>
          </div>
        )}

        {/* ── Distance Matrix Error message ── */}
        {distanceMatrixError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-800 font-medium leading-relaxed flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-red-600 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {distanceMatrixError}
          </div>
        )}

        {/* ── Optimization Stats ── */}
        {optimizeStats && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-emerald-900">Kết quả tối ưu</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  Trước tối ưu
                </p>
                <p className="text-xs text-emerald-900 font-medium">
                  {optimizeStats.before.distance} - {optimizeStats.before.duration}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  Sau tối ưu
                </p>
                <p className="text-xs text-emerald-900 font-medium">
                  {optimizeStats.after.distance} - {optimizeStats.after.duration}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete route button ── */}
        {plan && (
          <button
            onClick={handleDeleteRoute}
            className="text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Xóa tuyến hiện tại
          </button>
        )}

        {/* ── Feedback message ── */}
        {optimizeMsg && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3 text-xs text-cyan-800 font-medium leading-relaxed flex items-start gap-2 animate-slide-up">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-cyan-600 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {optimizeMsg}
          </div>
        )}

        {/* ── Route plan content ── */}
        {plan ? (
          <>
            {/* Stats */}
            <RouteStats points={plan.points} startPoint={plan.startPoint} />

            {/* Draw directions button */}
            <button
              onClick={handleDrawDirections}
              disabled={directionsLoading || plan.points.length < 2}
              className="w-full bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 disabled:bg-slate-400 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {directionsLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang tính tuyến...
                </>
              ) : directions ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l-7-7 7-7m8 7a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Cập nhật tuyến
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l-7-7 7-7m8 7a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Vẽ tuyến đường
                </>
              )}
            </button>

            {/* Directions panel */}
            <DirectionsPanel
              directions={directions}
              isLoading={directionsLoading}
              error={directionsError}
              onDrawRoute={handleRenderPolyline}
              onClearRoute={handleClearRoute}
            />

            {/* Coordinate status */}
            {coordMsg && (
              <div
                className={`rounded-xl border px-4 py-3 text-xs font-medium leading-relaxed flex items-start gap-2 ${coordMsg.cls}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 mt-0.5 shrink-0 ${coordMsg.icon}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {coordMsg.text}
              </div>
            )}

            {/* Offline data notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <p className="text-[11px] text-slate-500 font-medium">
                Dữ liệu tuyến lưu cục bộ · Hoạt động offline · Key:{" "}
                <code className="text-[10px] bg-slate-100 px-1 rounded">
                  shiproute_route_plan
                </code>
              </p>
            </div>

            {/* ── Start point display ── */}
            {plan.startPoint && (
              <div className="bg-white rounded-2xl border-2 border-dashed border-cyan-300 shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
                    Xuất phát
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {plan.startPoint.name}
                  </p>
                  {plan.startPoint.address && (
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {plan.startPoint.address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Points list ── */}
            <div className="flex flex-col gap-2.5">
              {plan.points.map((point, idx) => (
                <RoutePointCard
                  key={point.orderId}
                  point={point}
                  index={idx}
                  total={plan.points.length}
                  onMoveUp={() => moveTo(idx, idx - 1)}
                  onMoveDown={() => moveTo(idx, idx + 1)}
                  onMoveToTop={() => moveTo(idx, 0)}
                  onMoveToBottom={() => moveTo(idx, plan.points.length - 1)}
                />
              ))}
            </div>
          </>
        ) : (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <p className="text-slate-800 font-bold text-lg mb-1">
              Chưa có tuyến đường
            </p>
            <p className="text-slate-500 text-sm mb-4 max-w-xs">
              Nhập điểm bắt đầu (không bắt buộc), rồi bấm{" "}
              <span className="font-bold text-cyan-600">
                &quot;Tạo tuyến từ đơn&quot;
              </span>{" "}
              để lập tuyến từ các đơn chờ giao.
            </p>
            {!hasExistingOrders && (
              <p className="text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Chưa có đơn chờ giao. Hãy{" "}
                <button
                  onClick={() => router.push("/orders")}
                  className="underline font-bold"
                >
                  thêm đơn giao
                </button>{" "}
                trước.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
