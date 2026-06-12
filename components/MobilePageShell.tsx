import React from "react";

export const MobilePageShell = ({
  children,
  title,
  showBack = false,
}: {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}) => {
  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col max-w-md mx-auto shadow-xl pb-safe">
      {title && (
        <header className="bg-white text-slate-900 px-4 py-4 sticky top-0 z-10 flex items-center shadow-sm border-b border-slate-200">
          {showBack && (
            <button
              onClick={() => window.history.back()}
              className="mr-3 p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 active:bg-slate-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        </header>
      )}
      <main className="flex-1 p-4 flex flex-col gap-5 pb-24">{children}</main>
    </div>
  );
};
