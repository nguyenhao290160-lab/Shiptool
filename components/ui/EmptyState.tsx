import React from "react";

export const EmptyState = ({ title, desc, icon, className = "" }: { title: string; desc?: string; icon?: React.ReactNode; className?: string }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-8 text-center ${className}`}>
      {icon || (
        <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center mb-1 text-slate-400" style={{ boxShadow: "var(--shadow-sm)" }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      )}
      <div className="text-base font-bold text-slate-800">{title}</div>
      {desc && <div className="text-sm text-slate-500 max-w-sm leading-relaxed">{desc}</div>}
    </div>
  );
};
