import { DeliveryRoutePlan } from "./types";

const ROUTE_PLAN_KEY = "shiproute_route_plan";

// ── Read ────────────────────────────────────────────────────────────

export const getRoutePlan = (): DeliveryRoutePlan | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ROUTE_PLAN_KEY);
    return raw ? (JSON.parse(raw) as DeliveryRoutePlan) : null;
  } catch (err) {
    console.error("[routeStorage] parse error", err);
    return null;
  }
};

// ── Write ───────────────────────────────────────────────────────────

export const saveRoutePlan = (plan: DeliveryRoutePlan): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    ROUTE_PLAN_KEY,
    JSON.stringify({ ...plan, updatedAt: new Date().toISOString() })
  );
};

// ── Delete ──────────────────────────────────────────────────────────

export const deleteRoutePlan = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ROUTE_PLAN_KEY);
};
