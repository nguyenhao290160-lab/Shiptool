"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global boundary error caught:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-5 text-center">
      <div className="bg-white border border-slate-200/80 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-xl relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl" />

        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 mx-auto bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-center text-3xl">
            ⚠️
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Đã xảy ra lỗi hệ thống</h1>
          
          <p className="text-sm text-slate-500 leading-relaxed">
            Ứng dụng gặp sự cố không mong muốn trong quá trình xử lý dữ liệu cục bộ.
          </p>

          {error.message && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left font-mono text-[11px] text-slate-600 max-h-32 overflow-y-auto break-all">
              {error.message}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => reset()}
              className="flex-1 inline-flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-cyan-600/10 gap-2 text-sm cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
              </svg>
              Thử lại
            </button>
            <Link
              href="/home"
              className="flex-1 inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold py-3 px-4 rounded-xl transition-all gap-2 text-sm"
            >
              Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
