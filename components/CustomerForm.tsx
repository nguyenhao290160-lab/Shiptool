"use client";

import React, { useState } from "react";
import { FrequentCustomer } from "@/lib/types";

interface CustomerFormProps {
  customer?: FrequentCustomer;
  onSubmit: (data: Omit<FrequentCustomer, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit, onCancel }) => {
  const [name, setName] = useState(customer?.name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [note, setNote] = useState(customer?.note || "");
  const [lat, setLat] = useState(customer?.lat?.toString() || "");
  const [lng, setLng] = useState(customer?.lng?.toString() || "");
  const [tagsInput, setTagsInput] = useState(customer?.tags?.join(", ") || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Tên khách hàng không được để trống");
      return;
    }

    if (!address.trim()) {
      alert("Địa chỉ không được để trống");
      return;
    }

    setLoading(true);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      const data: Omit<FrequentCustomer, "id" | "createdAt" | "updatedAt"> = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim(),
        note: note.trim() || undefined,
        lat: lat.trim() ? parseFloat(lat) : undefined,
        lng: lng.trim() ? parseFloat(lng) : undefined,
        geocodedAddress: customer?.geocodedAddress,
        placeId: customer?.placeId,
        totalOrders: customer?.totalOrders || 0,
        deliveredOrders: customer?.deliveredOrders || 0,
        failedOrders: customer?.failedOrders || 0,
        cancelledOrders: customer?.cancelledOrders || 0,
        lastOrderAt: customer?.lastOrderAt,
        tags: tags.length > 0 ? tags : undefined,
      };

      onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Tên khách hàng *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: Tôn Thất Nam"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Số điện thoại (tùy chọn)
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ví dụ: 0123 456 789"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Địa chỉ *
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Ví dụ: 100 Nguyễn Thị Thập, Q.7, TP.HCM"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Ghi chú (tùy chọn)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ví dụ: Cổng màu xanh, gõ chuông khi tới"
          rows={2}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Tags (tùy chọn, cách nhau bằng dấu phẩy)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Ví dụ: VIP, Thường giao buổi sáng, Quen"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Latitude (tùy chọn)
          </label>
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="10.7621"
            step="0.0001"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Longitude (tùy chọn)
          </label>
          <input
            type="number"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="106.6821"
            step="0.0001"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm"
        >
          {loading ? "Đang lưu..." : customer ? "Cập nhật" : "Thêm khách"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded-lg transition-colors text-sm"
        >
          Hủy
        </button>
      </div>
    </form>
  );
};
