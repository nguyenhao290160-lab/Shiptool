/**
 * Operating cost utilities for ShipRoute AI (Prompt 15)
 * Calculate fuel cost, maintenance, operating cost, revenue, profit
 */

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

export const DEFAULT_COST_SETTINGS: OperatingCostSettings = {
  fuelPricePerLiter: 25000,
  fuelConsumptionPer100Km: 2.2,
  maintenanceCostPerKm: 300,
  otherCostPerRoute: 0,
  defaultShippingFeePerOrder: 0,
  currency: "VND",
  updatedAt: new Date().toISOString(),
};

/**
 * Format currency to Vietnamese Dong
 */
export function formatVnd(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat("vi-VN").format(rounded);
  return `${formatted}đ`;
}

/**
 * Format distance in kilometers
 */
export function formatDistanceKm(distanceKm: number): string {
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Format fuel quantity in liters
 */
export function formatLiters(liters: number): string {
  return `${liters.toFixed(1)} L`;
}

/**
 * Calculate operating cost based on settings and distance
 */
export function calculateOperatingCost(
  totalDistanceKm: number,
  totalOrders: number,
  settings: OperatingCostSettings
): RouteCostEstimate {
  // Validate inputs
  if (totalDistanceKm <= 0 || totalOrders <= 0) {
    return {
      totalDistanceKm,
      totalOrders,
      fuelLiters: 0,
      fuelCost: 0,
      maintenanceCost: 0,
      otherCost: 0,
      totalOperatingCost: 0,
      estimatedRevenue: 0,
      estimatedProfit: 0,
      costPerOrder: 0,
      revenuePerOrder: 0,
      profitPerOrder: 0,
      calculatedAt: new Date().toISOString(),
    };
  }

  // Calculate fuel cost
  const fuelLiters = (totalDistanceKm * settings.fuelConsumptionPer100Km) / 100;
  const fuelCost = fuelLiters * settings.fuelPricePerLiter;

  // Calculate maintenance cost
  const maintenanceCostPerKm = settings.maintenanceCostPerKm || 0;
  const maintenanceCost = totalDistanceKm * maintenanceCostPerKm;

  // Other costs
  const otherCost = settings.otherCostPerRoute || 0;

  // Total operating cost
  const totalOperatingCost = fuelCost + maintenanceCost + otherCost;

  // Calculate revenue and profit
  const feePerOrder = settings.defaultShippingFeePerOrder || 0;
  const estimatedRevenue = totalOrders * feePerOrder;
  const estimatedProfit = estimatedRevenue - totalOperatingCost;

  // Per-order metrics
  const costPerOrder = totalOperatingCost / totalOrders;
  const revenuePerOrder = feePerOrder;
  const profitPerOrder = estimatedProfit / totalOrders;

  return {
    totalDistanceKm,
    totalOrders,
    fuelLiters,
    fuelCost,
    maintenanceCost,
    otherCost,
    totalOperatingCost,
    estimatedRevenue,
    estimatedProfit,
    costPerOrder,
    revenuePerOrder,
    profitPerOrder,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Check if profit is negative (loss)
 */
export function isLoss(estimate: RouteCostEstimate): boolean {
  return estimate.estimatedProfit < 0;
}

/**
 * Get profit margin percentage
 */
export function getProfitMargin(estimate: RouteCostEstimate): number {
  if (estimate.estimatedRevenue === 0) return 0;
  return (estimate.estimatedProfit / estimate.estimatedRevenue) * 100;
}

/**
 * Format profit margin as percentage string
 */
export function formatProfitMargin(estimate: RouteCostEstimate): string {
  const margin = getProfitMargin(estimate);
  return `${margin.toFixed(1)}%`;
}

/**
 * Get color class for profit indicator (tailwind)
 */
export function getProfitColorClass(estimate: RouteCostEstimate): string {
  if (estimate.estimatedProfit < 0) {
    return "text-red-600";
  }
  if (estimate.estimatedProfit === 0) {
    return "text-slate-600";
  }
  return "text-green-600";
}

/**
 * Get background color class for profit card (tailwind)
 */
export function getProfitCardBgClass(estimate: RouteCostEstimate): string {
  if (estimate.estimatedProfit < 0) {
    return "bg-red-50 border-red-200";
  }
  if (estimate.estimatedProfit === 0) {
    return "bg-slate-50 border-slate-200";
  }
  return "bg-green-50 border-green-200";
}
