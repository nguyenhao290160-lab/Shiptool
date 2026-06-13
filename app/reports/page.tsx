"use client";

import React, { useMemo, useState } from "react";
import { exportReportJson, exportReportCsv } from "@/lib/reportExport";

interface DeliveryOrder {
  id: string;
  createdAt: string;
  customerName?: string;
  phone?: string;
  address?: string;
  status?: string;
  priority?: string;
  lat?: number | null;
  lng?: number | null;
  note?: string;
}

interface RouteHistoryItem {
  id: string;
  name?: string;
  date?: string;
  status?: string;
  ordersCount?: number;
  totalDistanceKm?: number;
  totalDurationMinutes?: number;
  costEstimate?: number;
}

interface CostSettings {
  fuelPricePerLiter?: number;
  fuelConsumptionPer100Km?: number;
  maintenanceCostPerKm?: number;
  otherCostPerRoute?: number;
  defaultShippingFeePerOrder?: number;
}

interface FrequentCustomer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
  totalOrders?: number;
}

const LS_KEYS = {
  orders: "shiproute_delivery_orders",
  routes: "shiproute_route_history",
  customers: "shiproute_frequent_customers",
  costSettings: "shiproute_cost_settings",
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function formatVnd(v = 0) {
  try {
    return v.toLocaleString("vi-VN") + "đ";
  } catch {
    return `${v}đ`;
  }
}

function formatKm(km?: number) {
  if (km === undefined || km === null) return "-";
  return `${Number(km).toFixed(1)} km`;
}

function formatMinutes(min?: number) {
  if (min === undefined || min === null) return "-";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function ReportsPage() {
  const [orders] = useState<DeliveryOrder[]>(() => {
    if (typeof window === "undefined") return [];
    return safeParse<DeliveryOrder[]>(localStorage.getItem(LS_KEYS.orders)) ?? [];
  });
  const [routes] = useState<RouteHistoryItem[]>(() => {
    if (typeof window === "undefined") return [];
    return safeParse<RouteHistoryItem[]>(localStorage.getItem(LS_KEYS.routes)) ?? [];
  });
  const [customers] = useState<FrequentCustomer[]>(() => {
    if (typeof window === "undefined") return [];
    return safeParse<FrequentCustomer[]>(localStorage.getItem(LS_KEYS.customers)) ?? [];
  });
  const [costSettings] = useState<CostSettings | null>(() => {
    if (typeof window === "undefined") return null;
    return safeParse<CostSettings>(localStorage.getItem(LS_KEYS.costSettings));
  });

  const [range, setRange] = useState<string>("7");
  const [customFrom, setCustomFrom] = useState<string>(new Date().toISOString().slice(0, 10));
  const [customTo, setCustomTo] = useState<string>(new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const { fromDate, toDate } = useMemo(() => {
    const today = new Date();
    let from = new Date();
    let to = new Date();
    if (range === "today") {
      from = new Date(today.setHours(0, 0, 0, 0));
      to = new Date(today.setHours(23, 59, 59, 999));
    } else if (range === "7") {
      from = new Date();
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      to = new Date();
      to.setHours(23, 59, 59, 999);
    } else if (range === "30") {
      from = new Date();
      from.setDate(from.getDate() - 29);
      from.setHours(0, 0, 0, 0);
      to = new Date();
      to.setHours(23, 59, 59, 999);
    } else {
      from = new Date(customFrom + "T00:00:00");
      to = new Date(customTo + "T23:59:59");
    }
    return { fromDate: from, toDate: to };
  }, [range, customFrom, customTo]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const created = o.createdAt ? new Date(o.createdAt) : null;
      if (!created) return false;
      if (created < fromDate || created > toDate) return false;
      if (statusFilter !== "all" && (o.status ?? "") !== statusFilter) return false;
      if (priorityFilter !== "all" && (o.priority ?? "") !== priorityFilter) return false;
      return true;
    });
  }, [orders, fromDate, toDate, statusFilter, priorityFilter]);

  const filteredRoutes = useMemo(() => {
    return routes.filter((r) => {
      if (!r.date) return false;
      const d = new Date(r.date);
      return d >= fromDate && d <= toDate;
    });
  }, [routes, fromDate, toDate]);

  const summary = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const pendingOrders = filteredOrders.filter((o) => (o.status ?? "") === "pending").length;
    const deliveringOrders = filteredOrders.filter((o) => (o.status ?? "") === "delivering").length;
    const deliveredOrders = filteredOrders.filter((o) => (o.status ?? "") === "delivered").length;
    const failedOrders = filteredOrders.filter((o) => (o.status ?? "") === "failed").length;
    const cancelledOrders = filteredOrders.filter((o) => (o.status ?? "") === "cancelled").length;
    const highPriorityOrders = filteredOrders.filter((o) => (o.priority ?? "") === "high").length;
    const ordersWithCoordinates = filteredOrders.filter((o) => typeof o.lat === "number" && typeof o.lng === "number").length;
    const ordersMissingCoordinates = totalOrders - ordersWithCoordinates;

    const totalRoutes = filteredRoutes.length;
    const completedRoutes = filteredRoutes.filter((r) => (r.status ?? "") === "completed").length;
    const totalDistanceKm = filteredRoutes.reduce((s, r) => s + (r.totalDistanceKm ?? 0), 0);
    const totalDurationMinutes = filteredRoutes.reduce((s, r) => s + (r.totalDurationMinutes ?? 0), 0);

    let totalOperatingCost: number | undefined = undefined;
    let estimatedRevenue: number | undefined = undefined;
    let estimatedProfit: number | undefined = undefined;
    if (costSettings) {
      const liters = (totalDistanceKm * (costSettings.fuelConsumptionPer100Km ?? 0)) / 100;
      const fuelCost = liters * (costSettings.fuelPricePerLiter ?? 0);
      const maintenanceCost = totalDistanceKm * (costSettings.maintenanceCostPerKm ?? 0);
      const other = costSettings.otherCostPerRoute ? costSettings.otherCostPerRoute * totalRoutes : 0;
      totalOperatingCost = fuelCost + maintenanceCost + other;
      estimatedRevenue = (costSettings.defaultShippingFeePerOrder ?? 0) * totalOrders;
      estimatedProfit = (estimatedRevenue ?? 0) - totalOperatingCost;
    }

    return {
      totalOrders,
      pendingOrders,
      deliveringOrders,
      deliveredOrders,
      failedOrders,
      cancelledOrders,
      successRate: totalOrders ? Math.round((deliveredOrders / totalOrders) * 100 * 10) / 10 : 0,
      failureRate: totalOrders ? Math.round(((failedOrders + cancelledOrders) / totalOrders) * 100 * 10) / 10 : 0,
      highPriorityOrders,
      ordersWithCoordinates,
      ordersMissingCoordinates,
      totalRoutes,
      completedRoutes,
      totalDistanceKm,
      totalDurationMinutes,
      totalOperatingCost,
      estimatedRevenue,
      estimatedProfit,
      costPerOrder: totalOrders && totalOperatingCost ? totalOperatingCost / totalOrders : undefined,
    };
  }, [filteredOrders, filteredRoutes, costSettings]);

  function exportJson() {
    const payload = {
      metadata: {
        generatedAt: new Date().toISOString(),
        filter: { from: fromDate.toISOString(), to: toDate.toISOString(), status: statusFilter, priority: priorityFilter },
      },
      summary,
      orders: filteredOrders,
      routes: filteredRoutes,
      customers: customers ?? [],
      costSettings: costSettings ?? null,
    };
    exportReportJson(payload);
  }

  

  function exportCsv() {
    const headers = ["createdAt", "customerName", "phone", "address", "status", "priority", "lat", "lng", "note"];
    // prepare rows as objects keyed by headers
    const rows = filteredOrders.map((o) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((h) => {
        switch (h) {
          case "createdAt":
            obj[h] = o.createdAt ?? "";
            break;
          case "customerName":
            obj[h] = o.customerName ?? "";
            break;
          case "phone":
            obj[h] = o.phone ?? "";
            break;
          case "address":
            obj[h] = o.address ?? "";
            break;
          case "status":
            obj[h] = o.status ?? "";
            break;
          case "priority":
            obj[h] = o.priority ?? "";
            break;
          case "lat":
            obj[h] = typeof o.lat === "number" ? o.lat : "";
            break;
          case "lng":
            obj[h] = typeof o.lng === "number" ? o.lng : "";
            break;
          case "note":
            obj[h] = o.note ?? "";
            break;
          default:
            obj[h] = "";
        }
      });
      return obj;
    });
    exportReportCsv(rows, headers);
  }

  function onPrint() {
    window.print();
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Báo cáo nâng cao</h1>

      <section className="mb-4 bg-white p-3 rounded shadow">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700">Khoảng thời gian</label>
            <div className="flex gap-2 mt-1">
              <select value={range} onChange={(e) => setRange(e.target.value)} className="border rounded px-2 py-1">
                <option value="today">Hôm nay</option>
                <option value="7">7 ngày gần đây</option>
                <option value="30">30 ngày gần đây</option>
                <option value="custom">Tùy chọn</option>
              </select>
              {range === "custom" && (
                <div className="flex gap-2 items-center">
                  <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="border rounded px-2 py-1" />
                  <span>-</span>
                  <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="border rounded px-2 py-1" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Trạng thái đơn</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded px-2 py-1 mt-1">
              <option value="all">Tất cả</option>
              <option value="pending">Chờ giao</option>
              <option value="delivering">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="failed">Thất bại</option>
              <option value="cancelled">Hủy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Ưu tiên</label>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="border rounded px-2 py-1 mt-1">
              <option value="all">Tất cả</option>
              <option value="high">Cao</option>
              <option value="normal">Bình thường</option>
              <option value="low">Thấp</option>
            </select>
          </div>

          <div className="ml-auto flex gap-2">
            <button onClick={exportJson} className="bg-sky-600 text-white px-3 py-1 rounded">Xuất báo cáo JSON</button>
            <button onClick={exportCsv} className="bg-emerald-600 text-white px-3 py-1 rounded">Xuất CSV</button>
            <button onClick={onPrint} className="bg-gray-600 text-white px-3 py-1 rounded">In báo cáo</button>
          </div>
        </div>
      </section>

      <section className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded shadow">
          <div className="text-sm text-slate-500">Tổng số đơn</div>
          <div className="text-xl font-bold">{summary.totalOrders}</div>
        </div>
        <div className="bg-white p-3 rounded shadow">
          <div className="text-sm text-slate-500">Đã giao</div>
          <div className="text-xl font-bold">{summary.deliveredOrders}</div>
        </div>
        <div className="bg-white p-3 rounded shadow">
          <div className="text-sm text-slate-500">Tỷ lệ thành công</div>
          <div className="text-xl font-bold">{summary.successRate}%</div>
        </div>

        <div className="bg-white p-3 rounded shadow">
          <div className="text-sm text-slate-500">Đơn ưu tiên cao</div>
          <div className="text-xl font-bold">{summary.highPriorityOrders}</div>
        </div>
        <div className="bg-white p-3 rounded shadow">
          <div className="text-sm text-slate-500">Đơn có tọa độ</div>
          <div className="text-xl font-bold">{summary.ordersWithCoordinates}</div>
        </div>
        <div className="bg-white p-3 rounded shadow">
          <div className="text-sm text-slate-500">Đơn thiếu tọa độ</div>
          <div className="text-xl font-bold">{summary.ordersMissingCoordinates}</div>
        </div>
      </section>

      <section className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Danh sách đơn ({filteredOrders.length})</h2>
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-4 rounded shadow">Không có dữ liệu phù hợp với bộ lọc hiện tại.</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2 text-left">Ngày</th>
                  <th className="p-2 text-left">Khách</th>
                  <th className="p-2 text-left">Điện thoại</th>
                  <th className="p-2 text-left">Địa chỉ</th>
                  <th className="p-2 text-left">Trạng thái</th>
                  <th className="p-2 text-left">Ưu tiên</th>
                  <th className="p-2 text-left">Tọa độ</th>
                  <th className="p-2 text-left">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="border-b">
                    <td className="p-2">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="p-2">{o.customerName ?? "-"}</td>
                    <td className="p-2">{o.phone ?? "-"}</td>
                    <td className="p-2">{o.address ?? "-"}</td>
                    <td className="p-2">{o.status ?? "-"}</td>
                    <td className="p-2">{o.priority ?? "-"}</td>
                    <td className="p-2">{typeof o.lat === "number" && typeof o.lng === "number" ? "Có" : "Chưa có"}</td>
                    <td className="p-2">{o.note ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Báo cáo tuyến ({filteredRoutes.length})</h2>
        {filteredRoutes.length === 0 ? (
          <div className="bg-white p-4 rounded shadow">Chưa có dữ liệu tuyến trong khoảng thời gian này.</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2 text-left">Ngày</th>
                  <th className="p-2 text-left">Tên tuyến</th>
                  <th className="p-2 text-left">Trạng thái</th>
                  <th className="p-2 text-left">Tổng đơn</th>
                  <th className="p-2 text-left">Tổng km</th>
                  <th className="p-2 text-left">Tổng thời gian</th>
                  <th className="p-2 text-left">Chi phí (ước tính)</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-2">{r.date ? new Date(r.date).toLocaleString() : "-"}</td>
                    <td className="p-2">{r.name ?? "-"}</td>
                    <td className="p-2">{r.status ?? "-"}</td>
                    <td className="p-2">{r.ordersCount ?? 0}</td>
                    <td className="p-2">{formatKm(r.totalDistanceKm)}</td>
                    <td className="p-2">{formatMinutes(r.totalDurationMinutes)}</td>
                    <td className="p-2">{r.costEstimate ? formatVnd(r.costEstimate) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Báo cáo chi phí</h2>
        {summary.totalOperatingCost === undefined ? (
          <div className="bg-white p-4 rounded shadow">Chưa có dữ liệu chi phí. Hãy cấu hình Chi phí vận hành để xem báo cáo tài chính.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded shadow">
              <div className="text-sm text-slate-500">Tổng chi phí vận hành</div>
              <div className="text-xl font-bold">{formatVnd(summary.totalOperatingCost ?? 0)}</div>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <div className="text-sm text-slate-500">Doanh thu ước tính</div>
              <div className="text-xl font-bold">{formatVnd(summary.estimatedRevenue ?? 0)}</div>
            </div>
            <div className={`p-3 rounded shadow ${summary.estimatedProfit !== undefined && summary.estimatedProfit < 0 ? "bg-rose-50" : "bg-white"}`}>
              <div className="text-sm text-slate-500">Lợi nhuận ước tính</div>
              <div className="text-xl font-bold">{summary.estimatedProfit !== undefined ? formatVnd(summary.estimatedProfit) : "-"}</div>
              {summary.estimatedProfit !== undefined && summary.estimatedProfit < 0 && (
                <div className="text-sm text-rose-700 mt-2">Lưu ý: tuyến đang lỗ theo ước tính chi phí vận hành.</div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Báo cáo khách hàng</h2>
        {(!customers || customers.length === 0) ? (
          <div className="bg-white p-4 rounded shadow">Chưa có dữ liệu khách hàng thường xuyên.</div>
        ) : (
          <div className="bg-white p-4 rounded shadow">
            <div>Tổng khách hàng thường xuyên: <strong>{customers.length}</strong></div>
            <div className="mt-2">Top 5 khách theo tổng đơn:</div>
            <ol className="mt-1 list-decimal ml-5">
              {customers.slice().sort((a,b)=> (b.totalOrders||0)-(a.totalOrders||0)).slice(0,5).map((c: FrequentCustomer)=> (
                <li key={c.id}>{c.name} — {c.totalOrders || 0} đơn {c.lat && c.lng ? "(Có tọa độ)" : "(Chưa có tọa độ)"}</li>
              ))}
            </ol>
          </div>
        )}
      </section>

    </div>
  );
}
