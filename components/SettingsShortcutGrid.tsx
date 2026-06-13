"use client";

import React from "react";
import { useRouter } from "next/navigation";

export function SettingsShortcutGrid() {
  const router = useRouter();

  const shortcuts = [
    { label: "Dashboard", description: "Báo cáo hiệu suất", icon: "📊", action: () => router.push("/home") },
    { label: "Quản lý đơn", description: "Danh sách đơn giao", icon: "📦", action: () => router.push("/orders") },
    { label: "Lập tuyến", description: "Tuyến đường mới", icon: "🗺️", action: () => router.push("/route-planner") },
    { label: "Bản đồ", description: "Hiển thị marker", icon: "📍", action: () => router.push("/new-route") },
    { label: "Backup", description: "Xuất/nhập dữ liệu", icon: "💾", action: () => router.push("/history") },
    { label: "Lịch sử", description: "Lịch sử tuyến", icon: "⏰", action: () => router.push("/history") },
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-lg">🚀</span>
        Truy cập nhanh
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        {shortcuts.map((shortcut, idx) => (
          <button
            key={idx}
            onClick={shortcut.action}
            className="bg-white rounded-xl p-3.5 border border-slate-200/80 text-left transition-all duration-200 hover:border-cyan-300 hover:bg-cyan-50/30 hover:shadow-md active:scale-[0.97] group"
          >
            <p className="text-2xl mb-1.5 transition-transform duration-200 group-hover:scale-110">{shortcut.icon}</p>
            <p className="font-bold text-sm text-slate-900">{shortcut.label}</p>
            <p className="text-xs text-slate-500">{shortcut.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
