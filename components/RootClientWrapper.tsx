"use client";

import React, { useEffect } from "react";
import { OfflineStatusBanner } from "./OfflineStatusBanner";
import { MobileNav } from "./MobileNav";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function RootClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Register service worker in production
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration failed - app will still work
      });
    }
  }, []);

  const menuItems = [
    { href: "/home", label: "Trang chủ", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
    )},
    { href: "/orders", label: "Quản lý đơn giao", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
    )},
    { href: "/route-planner", label: "Lập tuyến đường", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
    )},
    { href: "/customers", label: "Khách hàng", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    )},
    { href: "/history", label: "Lịch sử tuyến", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    )},
    { href: "/settings", label: "Cài đặt hệ thống", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    )},
    { href: "/reports", label: "Báo cáo hiệu suất", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3v18M21 7v14H3V3h6"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 3v4h-4"/></svg>
    )},
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <OfflineStatusBanner />
      
      {/* Sidebar navigation on Desktop viewports (md and up) */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 sticky top-0 h-screen p-5 justify-between z-30">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
              SR
            </div>
            <span className="font-black text-lg text-white tracking-tight">
              ShipRoute <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">AI</span>
            </span>
          </div>
          <nav className="space-y-1">
            {menuItems.map((it) => {
              // Active route rules:
              // - Exact match for home (/home or /)
              // - Orders, customers, history, settings, reports: startWith match
              // - Route group: both /route-planner and any /route/... pages should activate the same item
              const active = (() => {
                if (!pathname) return false;
                if (it.href === "/home") return pathname === "/home" || pathname === "/";
                if (it.href === "/route-planner") return pathname === "/route-planner" || pathname.startsWith("/route");
                return pathname === it.href || (it.href !== "/home" && pathname.startsWith(it.href));
              })();

              return (
                <Link
                  key={it.href}
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-3 py-3 pl-5 pr-4 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    active
                      ? "bg-gradient-to-r from-cyan-600/95 to-cyan-700 text-white shadow-lg shadow-cyan-600/20"
                      : "hover:bg-slate-800 hover:text-white text-slate-400"
                  }`}
                >
                  {/* left accent bar for active item */}
                  {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 rounded-r-md bg-cyan-400 shadow-sm" aria-hidden="true" />}
                  <div className={active ? "text-white" : "text-slate-400"}>
                    {it.icon}
                  </div>
                  <span>{it.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="px-2 py-3 border-t border-slate-800 text-[10px] text-slate-500 font-medium">
          Hệ thống chạy Cục bộ / Offline
        </div>
      </aside>

      {/* Main content viewport */}
      <div className="flex-grow flex flex-col min-w-0">
        <div className="pt-14 pb-20 md:pb-8 flex-1 w-full max-w-6xl mx-auto md:px-6">
          {children}
        </div>
        
        {/* Mobile bottom navigation bar */}
        <MobileNav />
      </div>
    </div>
  );
}
