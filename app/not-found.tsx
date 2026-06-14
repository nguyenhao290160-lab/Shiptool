import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-5 text-center">
      <div className="bg-white border border-slate-200/80 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-xl relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl" />

        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 mx-auto bg-cyan-50 rounded-2xl border border-cyan-100 flex items-center justify-center text-3xl">
            🔍
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-slate-800">Không tìm thấy trang</h2>
          
          <p className="text-sm text-slate-500 leading-relaxed">
            Đường dẫn bạn truy cập không tồn tại hoặc đã bị di chuyển. Hãy quay lại Trang chủ để tiếp tục làm việc.
          </p>

          <div className="pt-2">
            <Link
              href="/home"
              className="inline-flex items-center justify-center w-full bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-cyan-600/10 gap-2 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Quay lại Trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
