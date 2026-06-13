"use client";

import React, { useState } from "react";
import { FrequentCustomer, DeliveryOrder, DeliveryStatus, DeliveryPriority } from "@/lib/types";
import { upsertFrequentCustomerFromOrder } from "@/lib/customerStorage";
import { CustomerSuggestions } from "./CustomerSuggestions";

// ── Option lists ────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: DeliveryStatus; label: string }[] = [
  { value: "pending", label: "Chờ giao" },
  { value: "delivering", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "failed", label: "Thất bại" },
  { value: "cancelled", label: "Đã hủy" },
];

const PRIORITY_OPTIONS: { value: DeliveryPriority; label: string }[] = [
  { value: "high", label: "Cao" },
  { value: "normal", label: "Bình thường" },
  { value: "low", label: "Thấp" },
];

// ── Props ───────────────────────────────────────────────────────────

interface Props {
  /** If provided the form is in edit mode */
  initial?: DeliveryOrder;
  onSave: (order: DeliveryOrder) => void;
  onCancel: () => void;
}

// ── Component ───────────────────────────────────────────────────────

export const DeliveryOrderForm = ({ initial, onSave, onCancel }: Props) => {
  const isEdit = !!initial;

  const [customerName, setCustomerName] = useState(initial?.customerName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [status, setStatus] = useState<DeliveryStatus>(
    initial?.status ?? "pending"
  );
  const [priority, setPriority] = useState<DeliveryPriority>(
    initial?.priority ?? "normal"
  );
  const [lat, setLat] = useState<string>(initial?.lat?.toString() ?? "");
  const [lng, setLng] = useState<string>(initial?.lng?.toString() ?? "");
  const [latError, setLatError] = useState("");
  const [lngError, setLngError] = useState("");
  const [saveCustomer, setSaveCustomer] = useState<boolean>(true);

  // Suggestions derived from stored customers
  const suggestionQuery = phone.trim() ? phone.trim() : customerName.trim();

  // Validate and parse latitude
  const handleLatChange = (value: string) => {
    setLat(value);
    if (!value.trim()) {
      setLatError("");
      return;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < -90 || parsed > 90) {
      setLatError("Vĩ độ phải từ -90 đến 90");
    } else {
      setLatError("");
    }
  };

  // Validate and parse longitude
  const handleLngChange = (value: string) => {
    setLng(value);
    if (!value.trim()) {
      setLngError("");
      return;
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < -180 || parsed > 180) {
      setLngError("Kinh độ phải từ -180 đến 180");
    } else {
      setLngError("");
    }
  };

  // Parse coordinates for submission
  const parseCoordinates = () => {
    let parsedLat: number | undefined;
    let parsedLng: number | undefined;

    if (lat.trim()) {
      const latNum = parseFloat(lat);
      if (!isNaN(latNum) && latNum >= -90 && latNum <= 90) {
        parsedLat = latNum;
      }
    }

    if (lng.trim()) {
      const lngNum = parseFloat(lng);
      if (!isNaN(lngNum) && lngNum >= -180 && lngNum <= 180) {
        parsedLng = lngNum;
      }
    }

    return { parsedLat, parsedLng };
  };

  const handleSelectSuggestion = (c: FrequentCustomer) => {
    setCustomerName(c.name);
    setPhone(c.phone || "");
    setAddress(c.address);
    setNote(c.note || "");
    if (c.lat !== undefined) setLat(String(c.lat));
    if (c.lng !== undefined) setLng(String(c.lng));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !address.trim()) return;

    const { parsedLat, parsedLng } = parseCoordinates();
    const now = new Date().toISOString();
    const order: DeliveryOrder = {
      id: initial?.id ?? Date.now().toString(),
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      note: note.trim(),
      status,
      priority,
      lat: parsedLat ?? initial?.lat,
      lng: parsedLng ?? initial?.lng,
      geocodedAddress: initial?.geocodedAddress,
      placeId: initial?.placeId,
      geocodingStatus: initial?.geocodingStatus,
      geocodingError: initial?.geocodingError,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };

    // If creating new order and saveCustomer enabled, upsert into customers
    if (!isEdit && saveCustomer) {
      try {
        upsertFrequentCustomerFromOrder(order);
      } catch (err) {
        console.error("Error upserting customer from order", err);
      }
    }

    onSave(order);
  };

  // ── Shared input styles ───────────────────────────────────────────

  const inputClass =
    "w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 bg-white " +
    "focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all " +
    "placeholder:text-slate-400 font-medium";

  const labelClass = "block text-sm font-bold text-slate-700 mb-1.5";

  return (
    /* Overlay backdrop */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up"
      >
        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? "Chỉnh sửa đơn giao" : "Thêm đơn giao mới"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Customer name */}
          <div className="relative">
            <label className={labelClass}>
              Tên khách hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputClass}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              required
              autoFocus
            />
            <CustomerSuggestions query={suggestionQuery} onSelect={handleSelectSuggestion} visible={!!suggestionQuery} />
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>Số điện thoại</label>
            <input
              type="tel"
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0901234567"
            />
          </div>

          {/* Address */}
          <div>
            <label className={labelClass}>
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <textarea
              className={inputClass + " resize-none"}
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: 12 Nguyễn Huệ, Quận 1, TP.HCM"
              required
            />
          </div>

          {/* Note */}
          <div>
            <label className={labelClass}>Ghi chú</label>
            <textarea
              className={inputClass + " resize-none"}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Giao trước 10h, gọi trước khi đến"
            />
          </div>

          {/* Save customer checkbox */}
          {!isEdit && (
            <div className="flex items-center gap-2 pt-1">
              <input
                id="saveCustomer"
                type="checkbox"
                checked={saveCustomer}
                onChange={(e) => setSaveCustomer(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="saveCustomer" className="text-sm text-slate-700 font-medium">
                Lưu khách này vào danh sách khách thường xuyên
              </label>
            </div>
          )}

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Trạng thái</label>
              <select
                className={inputClass}
                value={status}
                onChange={(e) => setStatus(e.target.value as DeliveryStatus)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Mức ưu tiên</label>
              <select
                className={inputClass}
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as DeliveryPriority)
                }
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Advanced Coordinates Section ── */}
        <div className="border-t border-slate-100 px-6 py-4">
          <details className="group">
            <summary className="cursor-pointer font-bold text-sm text-slate-700 hover:text-slate-900 transition-colors list-none flex items-center gap-2">
              <span className="inline-flex w-5 h-5 items-center justify-center rounded border border-slate-300 group-open:bg-slate-100 transition-colors">
                <span className="text-xs font-bold text-slate-600">+</span>
              </span>
              Thông tin tọa độ nâng cao
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {/* Latitude */}
              <div>
                <label className={labelClass}>Vĩ độ (Lat)</label>
                <input
                  type="number"
                  step="0.000001"
                  className={
                    inputClass +
                    (latError ? " border-red-500 focus:border-red-500 focus:ring-red-500/20" : "")
                  }
                  value={lat}
                  onChange={(e) => handleLatChange(e.target.value)}
                  placeholder="-90 đến 90"
                />
                {latError && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{latError}</p>
                )}
              </div>

              {/* Longitude */}
              <div>
                <label className={labelClass}>Kinh độ (Lng)</label>
                <input
                  type="number"
                  step="0.000001"
                  className={
                    inputClass +
                    (lngError ? " border-red-500 focus:border-red-500 focus:ring-red-500/20" : "")
                  }
                  value={lng}
                  onChange={(e) => handleLngChange(e.target.value)}
                  placeholder="-180 đến 180"
                />
                {lngError && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{lngError}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Để trống nếu không có thông tin tọa độ
            </p>
          </details>
        </div>

        {/* ── Footer buttons ── */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="flex-1 py-3 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-700 active:bg-cyan-800 transition-colors shadow-sm shadow-cyan-600/20"
          >
            {isEdit ? "Cập nhật" : "Thêm đơn"}
          </button>
        </div>
      </form>
    </div>
  );
};
