import React from "react";

export const MobilePageShell = ({
  children,
  title,
  showBack = false,
  wide = false,
}: {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  wide?: boolean;
}) => {
  return (
    <div
      className={`min-h-[100dvh] bg-slate-50 flex flex-col mx-auto pb-safe ${
        wide
          ? "max-w-5xl"
          : "max-w-2xl"
      }`}
    >
      {title && (
        <header className="bg-white/80 backdrop-blur-md text-slate-900 px-5 py-4 sticky top-0 z-10 flex items-center border-b border-slate-200/80" style={{ boxShadow: "var(--shadow-sm)" }}>
          {showBack && (
            <button
              onClick={() => window.history.back()}
              className="mr-3 p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-700 active:bg-slate-200 transition-all"
              aria-label="Quay lại"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        </header>
      )}
      <main className="flex-1 p-4 md:p-6 flex flex-col gap-5 pb-24">{children}</main>
    </div>
  );
};
