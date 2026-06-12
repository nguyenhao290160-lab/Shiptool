"use client";

import React from "react";
import { useRouter } from "next/navigation";

export function SettingsShortcutGrid() {
  const router = useRouter();

  const shortcuts = [
    {
      label: "Dashboard",
      description: "Báo cáo hiệu suất",
      icon: "📊",
      route: "/home",
      action: () => {
        // Scroll to dashboard
        router.push("/home");
      },
    },
    {
      label: "Quản lý đơn",
      description: "Danh sách đơn giao",
      icon: "📦",
      route: "/orders",
      action: () => router.push("/orders"),
    },
    {
      label: "Lập tuyến",
      description: "Tuyến đường mới",
      icon: "🗺️",
      route: "/route-planner",
      action: () => router.push("/route-planner"),
    },
    {
      label: "Bản đồ",
      description: "Hiển thị marker",
      icon: "📍",
      route: "/new-route",
      action: () => router.push("/new-route"),
    },
    {
      label: "Backup",
      description: "Xuất/nhập dữ liệu",
      icon: "💾",
      route: "/orders",
      action: () => router.push("/orders"),
    },
    {
      label: "Lịch sử",
      description: "Lịch sử tuyến",
      icon: "⏰",
      route: "/history",
      action: () => router.push("/history"),
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-slate-900">Truy cập nhanh</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {shortcuts.map((shortcut, idx) => (
          <button
            key={idx}
            onClick={shortcut.action}
            className="bg-white rounded-2xl p-3 border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50 transition-colors text-left"
          >
            <p className="text-2xl mb-1">{shortcut.icon}</p>
            <p className="font-semibold text-sm text-slate-900">{shortcut.label}</p>
            <p className="text-xs text-slate-500">{shortcut.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
