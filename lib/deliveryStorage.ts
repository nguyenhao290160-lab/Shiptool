import { DeliveryOrder } from "./types";

const ORDERS_KEY = "shiproute_delivery_orders";

// ── Safe localStorage read ─────────────────────────────────────────

export const getDeliveryOrders = (): DeliveryOrder[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as DeliveryOrder[]) : [];
  } catch (err) {
    console.error("[deliveryStorage] parse error", err);
    return [];
  }
};

// ── Safe localStorage write ────────────────────────────────────────

const persist = (orders: DeliveryOrder[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

// ── CRUD ────────────────────────────────────────────────────────────

export const saveDeliveryOrder = (order: DeliveryOrder): void => {
  const orders = getDeliveryOrders();
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) {
    orders[idx] = { ...order, updatedAt: new Date().toISOString() };
  } else {
    orders.push(order);
  }
  persist(orders);
};

export const deleteDeliveryOrder = (id: string): void => {
  persist(getDeliveryOrders().filter((o) => o.id !== id));
};

export const getDeliveryOrderById = (
  id: string
): DeliveryOrder | undefined => {
  return getDeliveryOrders().find((o) => o.id === id);
};

// ── Demo data seeding ───────────────────────────────────────────────

const makeDemoOrders = (): DeliveryOrder[] => {
  const now = new Date().toISOString();
  return [
    {
      id: "demo-1",
      customerName: "Nguyễn Văn An",
      phone: "0901234567",
      address: "12 Nguyễn Huệ, Quận 1, TP.HCM",
      note: "Giao trước 10h sáng, gọi trước 15 phút",
      status: "pending",
      priority: "high",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-2",
      customerName: "Trần Thị Bình",
      phone: "0912345678",
      address: "45 Lê Lợi, Quận 3, TP.HCM",
      note: "",
      status: "delivering",
      priority: "normal",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-3",
      customerName: "Phạm Minh Châu",
      phone: "0923456789",
      address: "78 Điện Biên Phủ, Bình Thạnh, TP.HCM",
      note: "Hàng dễ vỡ, xin nhẹ tay",
      status: "delivered",
      priority: "normal",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-4",
      customerName: "Lê Hoàng Dũng",
      phone: "0934567890",
      address: "200 Cách Mạng Tháng 8, Quận 10, TP.HCM",
      note: "",
      status: "failed",
      priority: "low",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-5",
      customerName: "Võ Ngọc Em",
      phone: "0945678901",
      address: "33 Pasteur, Quận 1, TP.HCM",
      note: "Giao tầng 5, có thang máy",
      status: "pending",
      priority: "high",
      createdAt: now,
      updatedAt: now,
    },
  ];
};

/**
 * Initialise localStorage with demo data if empty.
 * Returns the current list (seeded or existing).
 */
export const seedDemoOrdersIfEmpty = (): DeliveryOrder[] => {
  const existing = getDeliveryOrders();
  if (existing.length > 0) return existing;

  const demo = makeDemoOrders();
  persist(demo);
  return demo;
};
