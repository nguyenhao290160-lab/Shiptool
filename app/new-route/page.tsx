"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MobilePageShell } from "@/components/MobilePageShell";
import { BigActionButton } from "@/components/BigActionButton";
import { saveRoute } from "@/lib/storage";
import { RoutePlan } from "@/lib/types";

export default function NewRoutePage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [name, setName] = useState("");
  const [startAddress, setStartAddress] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);

      setName(`Tuyến ngày ${new Date().toLocaleDateString("vi-VN")}`);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCreate = () => {
    if (!name.trim()) return;

    const newRoute: RoutePlan = {
      id: Date.now().toString(),
      name,
      startAddress,
      stops: [],
      currentStopIndex: 0,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveRoute(newRoute);
    router.push(`/route/${newRoute.id}/orders`);
  };

  if (!isMounted) {
    return <MobilePageShell title="Tạo tuyến mới" showBack><div className="p-5"></div></MobilePageShell>;
  }

  return (
    <MobilePageShell title="Tạo tuyến mới" showBack>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col gap-6 mt-4">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Tên tuyến</label>
          <input
            type="text"
            className="w-full border-2 border-slate-200 rounded-xl p-4 text-lg text-slate-900 bg-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 font-medium"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Tuyến Quận 1 - Quận 3"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Điểm xuất phát (Không bắt buộc)</label>
          <input
            type="text"
            className="w-full border-2 border-slate-200 rounded-xl p-4 text-lg text-slate-900 bg-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400 font-medium"
            value={startAddress}
            onChange={(e) => setStartAddress(e.target.value)}
            placeholder="Nhập địa chỉ bắt đầu đi"
          />
        </div>
      </div>

      <div className="mt-8 sticky bottom-4 z-10 px-1">
        <BigActionButton onClick={handleCreate}>
          Tiếp tục
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </BigActionButton>
      </div>
    </MobilePageShell>
  );
}
