"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const MobileNav = () => {
  const pathname = usePathname();

  const items = [
    { href: "/home", label: "Home", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.75L12 4l9 5.75V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.75z"/></svg>
    )},
    { href: "/orders", label: "Đơn", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18"/></svg>
    )},
    { href: "/route-planner", label: "Tuyến", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4 4 4M8 17l4 4 4-4"/></svg>
    )},
    { href: "/history", label: "Lịch sử", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    )},
    { href: "/settings", label: "Cài đặt", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.4 15a1.6 1.6 0 00.1-.4 1.6 1.6 0 00-.1-.4l1.7-1.2a.5.5 0 00.1-.8l-1.6-1.6a.5.5 0 00-.8.1L17.4 11a6.1 6.1 0 00-1.2-.7l-.3-1.9a.5.5 0 00-.5-.4h-2a.5.5 0 00-.5.4l-.3 1.9c-.4.2-.8.4-1.2.7L6.5 9.5a.5.5 0 00-.8-.1L4.1 11a.5.5 0 00.1.8l1.7 1.2c-.1.3-.1.7-.1 1a.5.5 0 00.1.4L4.2 16a.5.5 0 00-.1.8l1.6 1.6c.2.2.5.1.8-.1l1.9-1.2c.4.3.8.5 1.2.7l.3 1.9c.1.3.4.4.7.4h2c.3 0 .6-.1.7-.4l.3-1.9c.4-.2.8-.4 1.2-.7l1.9 1.2c.2.1.6.3.8.1l1.6-1.6a.5.5 0 00-.1-.8l-1.7-1.2z"/></svg>
    )},
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 md:hidden">
      <div className="max-w-3xl mx-auto flex justify-between items-center h-14 px-2">
        {items.map((it) => {
          const active = pathname === it.href || (it.href !== "/home" && pathname?.startsWith(it.href));
          return (
            <Link key={it.href} href={it.href} className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs ${active ? 'text-cyan-600' : 'text-slate-600 hover:text-slate-900'}`}>
              <div className={`p-2 rounded-lg ${active ? 'bg-cyan-50' : 'bg-transparent'}`}>
                {it.icon}
              </div>
              <div className="leading-none">{it.label}</div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

