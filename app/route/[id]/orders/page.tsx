"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { MobilePageShell } from "@/components/MobilePageShell";
import { BigActionButton } from "@/components/BigActionButton";
import { OrderCard } from "@/components/OrderCard";
import { BottomActionBar } from "@/components/BottomActionBar";
import { getRouteById, saveRoute } from "@/lib/storage";
import { RoutePlan, OrderStop } from "@/lib/types";
import { parseQuickOrderEntry } from "@/lib/quickEntryParser";

export default function OrdersPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [route, setRoute] = useState<RoutePlan | null>(null);
  
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isQuickMode, setIsQuickMode] = useState(true);
  const [quickText, setQuickText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");

  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<OrderStop>>({
    receiverName: "", phone: "", address: "", note: "", codAmount: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const r = getRouteById(resolvedParams.id);
      if (r) {
        setRoute(r);
      } else {
        router.replace("/home");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [resolvedParams.id, router]);

  if (!isMounted) return <MobilePageShell><div className="p-5"></div></MobilePageShell>;
  if (!route) return <MobilePageShell><p>Loading...</p></MobilePageShell>;

  const handleParseQuickEntry = () => {
    if (!quickText.trim()) return;
    const parsed = parseQuickOrderEntry(quickText);
    setForm(prev => ({ ...prev, ...parsed }));
    setIsQuickMode(false); // Move to manual mode to confirm
  };

  const handleSaveOrder = (andAddAnother: boolean = false) => {
    if (!form.address?.trim()) {
      alert("Vui lòng nhập địa chỉ giao hàng!");
      return;
    }

    const newOrder: OrderStop = {
      // eslint-disable-next-line react-hooks/purity
      id: editId || Date.now().toString(),
      label: form.receiverName ? form.receiverName : `Khách ${route.stops.length + 1}`,
      receiverName: form.receiverName,
      phone: form.phone,
      address: form.address,
      note: form.note,
      codAmount: Number(form.codAmount) || 0,
      status: "pending",
       
      createdAt: editId ? (route.stops.find(s => s.id === editId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
       
      updatedAt: new Date().toISOString(),
    };

    let updatedStops = [...route.stops];
    if (editId) {
      updatedStops = updatedStops.map(s => s.id === editId ? newOrder : s);
    } else {
      updatedStops.push(newOrder);
    }

    const updatedRoute = { ...route, stops: updatedStops };
    saveRoute(updatedRoute);
    setRoute(updatedRoute);

    if (andAddAnother) {
      resetForm();
    } else {
      setIsFormOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setEditId(null);
    setForm({ receiverName: "", phone: "", address: "", note: "", codAmount: 0 });
    setQuickText("");
    setIsQuickMode(true);
  };

  const openEdit = (order: OrderStop) => {
    setEditId(order.id);
    setForm({
      receiverName: order.receiverName || "",
      phone: order.phone || "",
      address: order.address || "",
      note: order.note || "",
      codAmount: order.codAmount || 0,
    });
    setIsQuickMode(false);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedRoute = { ...route, stops: route.stops.filter(s => s.id !== id) };
    saveRoute(updatedRoute);
    setRoute(updatedRoute);
  };

  const handleStartDelivery = () => {
    if (route.stops.length === 0) {
      alert("Chưa có đơn hàng nào!");
      return;
    }
    const updatedRoute: RoutePlan = { ...route, status: "delivering" };
    saveRoute(updatedRoute);
    router.push(`/route/${route.id}/delivery`);
  };

  return (
    <MobilePageShell title={route.name} showBack>
        <div className="mb-24">
        <div className="flex justify-between items-end mb-4 px-1">
          <h2 className="text-xl font-black text-slate-900">Danh sách đơn ({route.stops.length})</h2>
        </div>
          <div className="px-1 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tìm theo tên, SĐT, địa chỉ..."
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
                <option value="all">Tất cả</option>
                <option value="pending">Chờ giao</option>
                <option value="delivering">Đang giao</option>
                <option value="delivered">Đã giao</option>
                <option value="failed">Thất bại</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button 
            onClick={() => router.push(`/route/${route.id}/scan`)}
            className="bg-white border-2 border-slate-200 hover:border-orange-200 hover:bg-orange-50 text-slate-700 p-3 rounded-2xl text-sm font-bold flex flex-col items-center justify-center transition-colors active:scale-95 shadow-sm"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            Quét ảnh lấy địa chỉ
          </button>

          <button 
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="bg-white border-2 border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-700 p-3 rounded-2xl text-sm font-bold flex flex-col items-center justify-center transition-colors active:scale-95 shadow-sm"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            Nhập tay / Dán text
          </button>
        </div>
        
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 px-1 hide-scrollbar">
          <button 
            onClick={() => router.push(`/route/${route.id}/scan`)}
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap active:bg-slate-200 flex items-center"
          >
            📸 Chụp ảnh đơn
          </button>
          <button 
            onClick={() => router.push(`/route/${route.id}/scan`)}
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap active:bg-slate-200 flex items-center"
          >
            🖼️ Tải ảnh đơn
          </button>
        </div>

        {route.stops.length === 0 && !isFormOpen && (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm mt-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium mb-3 text-lg">Chưa có đơn hàng nào.</p>
            <button onClick={() => setIsFormOpen(true)} className="text-orange-600 font-bold text-lg hover:text-orange-700">Thêm đơn đầu tiên ngay</button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {route.stops
            .filter((s) => {
              if (statusFilter !== "all" && s.status !== statusFilter) return false;
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return (
                (s.receiverName || s.label || "").toLowerCase().includes(q) ||
                (s.phone || "").includes(q) ||
                (s.address || "").toLowerCase().includes(q) ||
                s.id.includes(q)
              );
            })
            .map((stop, i) => (
              <OrderCard
                key={stop.id}
                order={stop}
                index={i}
                onEdit={openEdit}
                onDelete={handleDelete}
                isDeliveryMode
                onStartDelivery={() => {
                  const updated = { ...stop, status: "delivering", updatedAt: new Date().toISOString() } as OrderStop;
                  const updatedStops = route.stops.map((s) => (s.id === stop.id ? updated : s));
                  const updatedRoute = { ...route, stops: updatedStops };
                  saveRoute(updatedRoute);
                  setRoute(updatedRoute);
                }}
                onMarkDelivered={() => {
                  const recipient = window.prompt("Tên người nhận (tùy chọn)", stop.recipientName || "") || undefined;
                  const note = window.prompt("Ghi chú giao (tùy chọn)", stop.deliveryNote || "") || undefined;
                  const now = new Date().toISOString();
                  const updated = { ...stop, status: "delivered", deliveredAt: now, recipientName: recipient, deliveryNote: note, updatedAt: now } as OrderStop;
                  const updatedStops = route.stops.map((s) => (s.id === stop.id ? updated : s));
                  const updatedRoute = { ...route, stops: updatedStops };
                  saveRoute(updatedRoute);
                  setRoute(updatedRoute);
                }}
                onMarkFailed={() => {
                  const reason = window.prompt("Lý do giao thất bại", stop.failureReason || "") || undefined;
                  const now = new Date().toISOString();
                  const updated = { ...stop, status: "failed", failedAt: now, failureReason: reason, updatedAt: now } as OrderStop;
                  const updatedStops = route.stops.map((s) => (s.id === stop.id ? updated : s));
                  const updatedRoute = { ...route, stops: updatedStops };
                  saveRoute(updatedRoute);
                  setRoute(updatedRoute);
                }}
              />
            ))}
        </div>
      </div>

      {/* Form Modal / Section */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="bg-slate-50 rounded-t-3xl h-[92vh] overflow-y-auto w-full max-w-md mx-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10 rounded-t-3xl">
              <h3 className="font-black text-xl text-slate-900">{editId ? "Sửa đơn" : "Thêm đơn hàng"}</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 flex-1 bg-white">
              {!editId && (
                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
                  <button 
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-colors ${isQuickMode ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setIsQuickMode(true)}
                  >
                    Nhập nhanh (1 dòng)
                  </button>
                  <button 
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-colors ${!isQuickMode ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setIsQuickMode(false)}
                  >
                    Nhập tay chi tiết
                  </button>
                </div>
              )}

              {isQuickMode && !editId ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-800 mb-2 block">Dán thông tin đơn hàng</label>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">Định dạng thường gặp: Tên - SĐT - Địa chỉ - Ghi chú</p>
                    <textarea 
                      className="w-full border-2 border-slate-200 rounded-2xl p-4 h-40 text-lg focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none placeholder:text-slate-300 font-medium text-slate-900"
                      placeholder="VD: Nguyễn Văn A - 0901234567 - 123 Nguyễn Trãi, P.2, Q.5, TP.HCM - gọi trước khi tới"
                      value={quickText}
                      onChange={(e) => setQuickText(e.target.value)}
                    />
                  </div>
                  <BigActionButton onClick={handleParseQuickEntry}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Phân tích & Tự điền
                  </BigActionButton>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Địa chỉ giao hàng <span className="text-red-500">*</span></label>
                    <textarea
                      className="w-full border-2 border-slate-200 rounded-2xl p-4 text-lg focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900 font-medium"
                      rows={2}
                      value={form.address}
                      onChange={(e) => setForm({...form, address: e.target.value})}
                      placeholder="VD: 123 Nguyễn Trãi..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">Tên khách</label>
                      <input
                        type="text"
                        className="w-full border-2 border-slate-200 rounded-2xl p-4 text-lg focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900 font-medium"
                        value={form.receiverName}
                        onChange={(e) => setForm({...form, receiverName: e.target.value})}
                        placeholder="Tên..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        className="w-full border-2 border-slate-200 rounded-2xl p-4 text-lg focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900 font-medium"
                        value={form.phone}
                        onChange={(e) => setForm({...form, phone: e.target.value})}
                        placeholder="09..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Tiền thu hộ (COD) - VNĐ</label>
                    <input
                      type="number"
                      className="w-full border-2 border-slate-200 rounded-2xl p-4 text-2xl font-black focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-emerald-600 placeholder:text-slate-300"
                      value={form.codAmount || ""}
                      onChange={(e) => setForm({...form, codAmount: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Ghi chú</label>
                    <input
                      type="text"
                      className="w-full border-2 border-slate-200 rounded-2xl p-4 text-lg focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-red-600 font-medium placeholder:text-slate-300"
                      value={form.note}
                      onChange={(e) => setForm({...form, note: e.target.value})}
                      placeholder="Cẩn thận hàng dễ vỡ..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex gap-3 pb-safe-offset-4">
              <BigActionButton className="flex-1 shadow-md" onClick={() => handleSaveOrder(false)}>
                Lưu đơn
              </BigActionButton>
              {!editId && !isQuickMode && (
                <BigActionButton variant="outline" className="flex-1 text-sm whitespace-nowrap shadow-sm border-slate-200 text-slate-700 hover:text-slate-900" onClick={() => handleSaveOrder(true)}>
                  Lưu & Thêm tiếp
                </BigActionButton>
              )}
            </div>
          </div>
        </div>
      )}

      {!isFormOpen && (
        <BottomActionBar>
          <div className="w-full flex gap-2">
            <BigActionButton variant="secondary" className="flex-1" onClick={() => router.push(`/route/${route.id}/driver`)}>
              Chế độ lái
            </BigActionButton>
            <BigActionButton variant="success" className="flex-1" onClick={handleStartDelivery}>
              Xong, Bắt đầu giao
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </BigActionButton>
          </div>
        </BottomActionBar>
      )}
    </MobilePageShell>
  );
}
