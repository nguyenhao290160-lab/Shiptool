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
  const [isMounted, setIsMounted] = useState(false);
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
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Set date defaults after mount to avoid SSR/CSR mismatch
  React.useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const t = setTimeout(() => {
      setIsMounted(true);
      setCustomFrom((prev) => prev || today);
      setCustomTo((prev) => prev || today);
    }, 0);
    return () => clearTimeout(t);
  }, []);

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

  if (!isMounted) {
    return (
      <div className="page-container">
        <main className="flex-1 p-4 md:p-6 flex flex-col gap-5 pb-24">
          <div className="text-center py-12 text-slate-500 font-semibold bg-white rounded-2xl border border-slate-200">
            Đang tải báo cáo hiệu suất...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-container">
      <main className="flex-1 p-4 md:p-6 flex flex-col gap-5 pb-24">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl p-6 text-center" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h1 className="text-2xl font-black text-white mb-1">Báo cáo nâng cao</h1>
            <p className="text-slate-300 text-sm">Phân tích hiệu suất giao hàng</p>
          </div>
        </div>

        {/* Filters */}
        <section className="card-premium">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Khoảng thời gian</label>
              <div className="flex gap-2 flex-wrap">
                <select value={range} onChange={(e) => setRange(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 outline-none">
                  <option value="today">Hôm nay</option>
                  <option value="7">7 ngày gần đây</option>
                  <option value="30">30 ngày gần đây</option>
                  <option value="custom">Tùy chọn</option>
                </select>
                {range === "custom" && (
                  <div className="flex gap-2 items-center">
                    <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500/30 outline-none" />
                    <span className="text-slate-400">—</span>
                    <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500/30 outline-none" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Trạng thái</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-cyan-500/30 outline-none">
                <option value="all">Tất cả</option>
                <option value="pending">Chờ giao</option>
                <option value="delivering">Đang giao</option>
                <option value="delivered">Đã giao</option>
                <option value="failed">Thất bại</option>
                <option value="cancelled">Hủy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Ưu tiên</label>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-cyan-500/30 outline-none">
                <option value="all">Tất cả</option>
                <option value="high">Cao</option>
                <option value="normal">Bình thường</option>
                <option value="low">Thấp</option>
              </select>
            </div>

            <div className="sm:ml-auto flex gap-2 flex-wrap">
              <button onClick={exportJson} className="bg-gradient-to-r from-sky-500 to-sky-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-sky-600 hover:to-sky-700 transition-all shadow-sm">Xuất JSON</button>
              <button onClick={exportCsv} className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm">Xuất CSV</button>
              <button onClick={onPrint} className="bg-white text-slate-700 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">In báo cáo</button>
            </div>
          </div>
        </section>

        {/* Summary Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Tổng số đơn", value: summary.totalOrders, color: "text-sky-600", bg: "bg-sky-50" },
            { label: "Đã giao", value: summary.deliveredOrders, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Tỷ lệ thành công", value: `${summary.successRate}%`, color: "text-cyan-600", bg: "bg-cyan-50" },
            { label: "Ưu tiên cao", value: summary.highPriorityOrders, color: "text-rose-600", bg: "bg-rose-50" },
            { label: "Có tọa độ", value: summary.ordersWithCoordinates, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Thiếu tọa độ", value: summary.ordersMissingCoordinates, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-slate-200/60`} style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</div>
              <div className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </section>

        {/* Orders Table */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">Danh sách đơn ({filteredOrders.length})</h2>
          {filteredOrders.length === 0 ? (
            <div className="card-premium p-8 text-center text-slate-500">Không có dữ liệu phù hợp với bộ lọc hiện tại.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80" style={{ boxShadow: "var(--shadow-sm)" }}>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80">
                    <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Ngày</th>
                    <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Khách</th>
                    <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">ĐT</th>
                    <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Địa chỉ</th>
                    <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Trạng thái</th>
                    <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Ưu tiên</th>
                    <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Tọa độ</th>
                    <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 whitespace-nowrap">{new Date(o.createdAt).toLocaleString()}</td>
                      <td className="p-3 font-medium">{o.customerName ?? "-"}</td>
                      <td className="p-3">{o.phone ?? "-"}</td>
                      <td className="p-3 max-w-[200px] truncate">{o.address ?? "-"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          o.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
                          o.status === "pending" ? "bg-amber-100 text-amber-700" :
                          o.status === "delivering" ? "bg-cyan-100 text-cyan-700" :
                          o.status === "failed" ? "bg-red-100 text-red-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>{o.status ?? "-"}</span>
                      </td>
                      <td className="p-3">{o.priority ?? "-"}</td>
                      <td className="p-3">
                        <span className={`text-xs font-bold ${typeof o.lat === "number" && typeof o.lng === "number" ? "text-emerald-600" : "text-slate-400"}`}>
                          {typeof o.lat === "number" && typeof o.lng === "number" ? "✓ Có" : "— Chưa"}
                        </span>
                      </td>
                      <td className="p-3 max-w-[150px] truncate text-slate-500">{o.note ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Routes Table */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">Báo cáo tuyến ({filteredRoutes.length})</h2>
          {filteredRoutes.length === 0 ? (
            <div className="card-premium p-8 text-center text-slate-500">Chưa có dữ liệu tuyến trong khoảng thời gian này.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/80" style={{ boxShadow: "var(--shadow-sm)" }}>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80">
                    <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Ngày</th>
                    <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Tên tuyến</th>
                    <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Trạng thái</th>
                    <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Tổng đơn</th>
                    <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Tổng km</th>
                    <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Thời gian</th>
                    <th className="p-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Chi phí</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredRoutes.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 whitespace-nowrap">{r.date ? new Date(r.date).toLocaleString() : "-"}</td>
                      <td className="p-3 font-medium">{r.name ?? "-"}</td>
                      <td className="p-3">{r.status ?? "-"}</td>
                      <td className="p-3">{r.ordersCount ?? 0}</td>
                      <td className="p-3">{formatKm(r.totalDistanceKm)}</td>
                      <td className="p-3">{formatMinutes(r.totalDurationMinutes)}</td>
                      <td className="p-3">{r.costEstimate ? formatVnd(r.costEstimate) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Cost Report */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">Báo cáo chi phí</h2>
          {summary.totalOperatingCost === undefined ? (
            <div className="card-premium p-8 text-center text-slate-500">Chưa có dữ liệu chi phí. Hãy cấu hình Chi phí vận hành để xem báo cáo tài chính.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-4 border border-slate-200/80" style={{ boxShadow: "var(--shadow-sm)" }}>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng chi phí vận hành</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{formatVnd(summary.totalOperatingCost ?? 0)}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200/80" style={{ boxShadow: "var(--shadow-sm)" }}>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doanh thu ước tính</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{formatVnd(summary.estimatedRevenue ?? 0)}</div>
              </div>
              <div className={`rounded-xl p-4 border ${summary.estimatedProfit !== undefined && summary.estimatedProfit < 0 ? "bg-rose-50 border-rose-200/80" : "bg-white border-slate-200/80"}`} style={{ boxShadow: "var(--shadow-sm)" }}>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lợi nhuận ước tính</div>
                <div className={`text-2xl font-black mt-1 ${summary.estimatedProfit !== undefined && summary.estimatedProfit < 0 ? "text-rose-600" : "text-cyan-600"}`}>{summary.estimatedProfit !== undefined ? formatVnd(summary.estimatedProfit) : "-"}</div>
                {summary.estimatedProfit !== undefined && summary.estimatedProfit < 0 && (
                  <div className="text-xs text-rose-600 mt-2 font-medium">Lưu ý: tuyến đang lỗ theo ước tính.</div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Customer Report */}
        <section className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Báo cáo khách hàng</h2>
          {(!customers || customers.length === 0) ? (
            <div className="card-premium p-8 text-center text-slate-500">Chưa có dữ liệu khách hàng thường xuyên.</div>
          ) : (
            <div className="card-premium">
              <div className="text-sm text-slate-700">Tổng khách hàng thường xuyên: <strong className="text-slate-900">{customers.length}</strong></div>
              <div className="mt-3 text-sm font-semibold text-slate-700">Top 5 khách theo tổng đơn:</div>
              <ol className="mt-2 space-y-1.5">
                {customers.slice().sort((a,b)=> (b.totalOrders||0)-(a.totalOrders||0)).slice(0,5).map((c: FrequentCustomer)=> (
                  <li key={c.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
                    <span className="font-medium text-slate-800">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan-600">{c.totalOrders || 0} đơn</span>
                      <span className={`text-xs font-bold ${c.lat && c.lng ? "text-emerald-600" : "text-slate-400"}`}>
                        {c.lat && c.lng ? "✓ Tọa độ" : "— Chưa"}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
