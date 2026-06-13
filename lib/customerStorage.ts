/**
 * localStorage handler for frequent customers (Prompt 16A)
 */

import { FrequentCustomer } from "./types";

const CUSTOMERS_KEY = "shiproute_frequent_customers";

/**
 * Get all frequent customers from localStorage
 */
export const getFrequentCustomers = (): FrequentCustomer[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FrequentCustomer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("[customerStorage] getFrequentCustomers error", err);
    return [];
  }
};

/**
 * Save all frequent customers to localStorage
 */
export const saveFrequentCustomers = (customers: FrequentCustomer[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  } catch (err) {
    console.error("[customerStorage] saveFrequentCustomers error", err);
  }
};

/**
 * Get single customer by ID
 */
export const getFrequentCustomerById = (id: string): FrequentCustomer | undefined => {
  const customers = getFrequentCustomers();
  return customers.find((c) => c.id === id);
};

/**
 * Create new frequent customer
 */
export const createFrequentCustomer = (data: Omit<FrequentCustomer, "id" | "createdAt" | "updatedAt">): FrequentCustomer => {
  const now = new Date().toISOString();
  const id = Date.now().toString();

  const customer: FrequentCustomer = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
    totalOrders: data.totalOrders || 0,
    deliveredOrders: data.deliveredOrders || 0,
    failedOrders: data.failedOrders || 0,
    cancelledOrders: data.cancelledOrders || 0,
  };

  const customers = getFrequentCustomers();
  customers.push(customer);
  saveFrequentCustomers(customers);

  return customer;
};

/**
 * Update existing frequent customer
 */
export const updateFrequentCustomer = (
  id: string,
  data: Partial<Omit<FrequentCustomer, "id" | "createdAt">>
): FrequentCustomer | undefined => {
  const customers = getFrequentCustomers();
  const idx = customers.findIndex((c) => c.id === id);

  if (idx >= 0) {
    const updated: FrequentCustomer = {
      ...customers[idx],
      ...data,
      id: customers[idx].id,
      createdAt: customers[idx].createdAt,
      updatedAt: new Date().toISOString(),
    };
    customers[idx] = updated;
    saveFrequentCustomers(customers);
    return updated;
  }

  return undefined;
};

/**
 * Delete frequent customer
 */
export const deleteFrequentCustomer = (id: string): void => {
  const customers = getFrequentCustomers();
  const filtered = customers.filter((c) => c.id !== id);
  saveFrequentCustomers(filtered);
};

/**
 * Clear all customers
 */
export const clearFrequentCustomers = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CUSTOMERS_KEY);
  } catch (err) {
    console.error("[customerStorage] clearFrequentCustomers error", err);
  }
};

/**
 * Upsert customer from order: match by phone if present, otherwise by name+address
 * Update stats: totalOrders, delivered/failed/cancelled based on order status
 */
import { DeliveryOrder } from "./types";

export const upsertFrequentCustomerFromOrder = (order: DeliveryOrder): void => {
  if (typeof window === "undefined") return;

  const customers = getFrequentCustomers();

  // Try match by phone first
  let match = undefined as FrequentCustomer | undefined;
  if (order.phone && order.phone.trim()) {
    match = customers.find((c) => c.phone && c.phone.trim() === order.phone.trim());
  }

  // If no phone match, match by name + address
  if (!match) {
    match = customers.find(
      (c) =>
        c.name.trim().toLowerCase() === order.customerName.trim().toLowerCase() &&
        c.address.trim().toLowerCase() === order.address.trim().toLowerCase()
    );
  }

  const now = new Date().toISOString();

  if (match) {
    // update existing
    const updated: FrequentCustomer = {
      ...match,
      name: order.customerName || match.name,
      phone: order.phone || match.phone,
      address: order.address || match.address,
      note: order.note || match.note,
      lat: order.lat ?? match.lat,
      lng: order.lng ?? match.lng,
      geocodedAddress: order.geocodedAddress ?? match.geocodedAddress,
      placeId: order.placeId ?? match.placeId,
      totalOrders: (match.totalOrders || 0) + 1,
      deliveredOrders: (match.deliveredOrders || 0) + (order.status === "delivered" ? 1 : 0),
      failedOrders: (match.failedOrders || 0) + (order.status === "failed" ? 1 : 0),
      cancelledOrders: (match.cancelledOrders || 0) + (order.status === "cancelled" ? 1 : 0),
      lastOrderAt: now,
      updatedAt: now,
      createdAt: match.createdAt,
      tags: match.tags,
    };

    const idx = customers.findIndex((c) => c.id === match!.id);
    if (idx >= 0) {
      customers[idx] = updated;
      saveFrequentCustomers(customers);
    }
  } else {
    // create new
    const id = Date.now().toString();
    const newCustomer: FrequentCustomer = {
      id,
      name: order.customerName,
      phone: order.phone,
      address: order.address,
      note: order.note,
      lat: order.lat,
      lng: order.lng,
      geocodedAddress: order.geocodedAddress,
      placeId: order.placeId,
      totalOrders: 1,
      deliveredOrders: order.status === "delivered" ? 1 : 0,
      failedOrders: order.status === "failed" ? 1 : 0,
      cancelledOrders: order.status === "cancelled" ? 1 : 0,
      lastOrderAt: now,
      tags: undefined,
      createdAt: now,
      updatedAt: now,
    };
    customers.push(newCustomer);
    saveFrequentCustomers(customers);
  }
};

/**
 * Calculate statistics for all customers
 */
export interface CustomerStatsSummary {
  totalCustomers: number;
  withCoordinates: number;
  withoutCoordinates: number;
  totalOrders: number;
  totalDelivered: number;
  totalFailed: number;
}

export const calculateStats = (customers: FrequentCustomer[]): CustomerStatsSummary => {
  const stats: CustomerStatsSummary = {
    totalCustomers: customers.length,
    withCoordinates: 0,
    withoutCoordinates: 0,
    totalOrders: 0,
    totalDelivered: 0,
    totalFailed: 0,
  };

  customers.forEach((customer) => {
    if (customer.lat !== undefined && customer.lng !== undefined) {
      stats.withCoordinates++;
    } else {
      stats.withoutCoordinates++;
    }

    stats.totalOrders += customer.totalOrders || 0;
    stats.totalDelivered += customer.deliveredOrders || 0;
    stats.totalFailed += customer.failedOrders || 0;
  });

  return stats;
};
