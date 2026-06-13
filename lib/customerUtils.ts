/**
 * Utility functions for frequent customers
 */

import { FrequentCustomer } from "./types";

/**
 * Filter customers by search query (name, phone, address, note, tags)
 */
export const filterCustomers = (customers: FrequentCustomer[], query: string): FrequentCustomer[] => {
  if (!query.trim()) return customers;

  const q = query.toLowerCase();
  return customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.note?.toLowerCase().includes(q) ||
      c.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });
};

/**
 * Sort type for customers
 */
export type CustomerSortType = "recent" | "most-orders" | "has-coords" | "no-coords";

/**
 * Sort customers
 */
export const sortCustomers = (customers: FrequentCustomer[], sortBy: CustomerSortType): FrequentCustomer[] => {
  const sorted = [...customers];

  switch (sortBy) {
    case "recent":
      // Most recent first
      sorted.sort((a, b) => {
        const aTime = new Date(a.lastOrderAt || a.createdAt).getTime();
        const bTime = new Date(b.lastOrderAt || b.createdAt).getTime();
        return bTime - aTime;
      });
      break;

    case "most-orders":
      // Most orders first
      sorted.sort((a, b) => b.totalOrders - a.totalOrders);
      break;

    case "has-coords":
      // Has coordinates first
      sorted.sort((a, b) => {
        const aHas = a.lat !== undefined && a.lng !== undefined ? 1 : 0;
        const bHas = b.lat !== undefined && b.lng !== undefined ? 1 : 0;
        return bHas - aHas;
      });
      break;

    case "no-coords":
      // No coordinates first
      sorted.sort((a, b) => {
        const aHas = a.lat !== undefined && a.lng !== undefined ? 1 : 0;
        const bHas = b.lat !== undefined && b.lng !== undefined ? 1 : 0;
        return aHas - bHas;
      });
      break;

    default:
      break;
  }

  return sorted;
};

/**
 * Calculate customer stats summary
 */
export interface CustomerStatsSummary {
  totalCustomers: number;
  withCoordinates: number;
  withoutCoordinates: number;
  totalOrders: number;
  totalDelivered: number;
  totalFailed: number;
  mostRecentOrder?: string;
}

export const calculateCustomerStats = (customers: FrequentCustomer[]): CustomerStatsSummary => {
  const withCoords = customers.filter((c) => c.lat !== undefined && c.lng !== undefined).length;
  const withoutCoords = customers.length - withCoords;

  let mostRecentOrder: string | undefined;
  let mostRecentTime = 0;

  customers.forEach((c) => {
    if (c.lastOrderAt) {
      const time = new Date(c.lastOrderAt).getTime();
      if (time > mostRecentTime) {
        mostRecentTime = time;
        mostRecentOrder = c.lastOrderAt;
      }
    }
  });

  return {
    totalCustomers: customers.length,
    withCoordinates: withCoords,
    withoutCoordinates: withoutCoords,
    totalOrders: customers.reduce((sum, c) => sum + c.totalOrders, 0),
    totalDelivered: customers.reduce((sum, c) => sum + c.deliveredOrders, 0),
    totalFailed: customers.reduce((sum, c) => sum + c.failedOrders, 0),
    mostRecentOrder,
  };
};

/**
 * Format last order time for display
 */
export const formatLastOrderTime = (date: string | undefined): string => {
  if (!date) return "Chưa giao";

  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins}p trước`;
  if (diffHours < 24) return `${diffHours}h trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;

  return then.toLocaleDateString("vi-VN");
};

/**
 * Get delivery success rate
 */
export const getSuccessRate = (customer: FrequentCustomer): number => {
  if (customer.totalOrders === 0) return 0;
  return Math.round((customer.deliveredOrders / customer.totalOrders) * 100);
};
