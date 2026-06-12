import React from "react";

export const EmptyState = ({ title, desc, icon, className = "" }: { title: string; desc?: string; icon?: React.ReactNode; className?: string }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 text-center ${className}`}>
      {icon || (
        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      )}
      <div className="text-lg font-bold text-slate-800">{title}</div>
      {desc && <div className="text-sm text-slate-500">{desc}</div>}
    </div>
  );
};

