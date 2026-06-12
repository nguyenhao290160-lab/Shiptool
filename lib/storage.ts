import { RoutePlan } from "./types";

const ROUTES_KEY = "shiproute_routes";

export const getRoutes = (): RoutePlan[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(ROUTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to parse routes from localStorage", error);
    return [];
  }
};

export const getRouteById = (id: string): RoutePlan | null => {
  const routes = getRoutes();
  return routes.find((r) => r.id === id) || null;
};

export const saveRoute = (route: RoutePlan): void => {
  if (typeof window === "undefined") return;
  const routes = getRoutes();
  const index = routes.findIndex((r) => r.id === route.id);
  if (index >= 0) {
    routes[index] = route;
  } else {
    routes.push(route);
  }
  localStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
};

export const deleteRoute = (id: string): void => {
  if (typeof window === "undefined") return;
  const routes = getRoutes().filter((r) => r.id !== id);
  localStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
};

export const getActiveRoute = (): RoutePlan | null => {
  const routes = getRoutes();
  return routes.find((r) => r.status === "delivering") || null;
};
