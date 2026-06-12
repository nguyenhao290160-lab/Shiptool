import React from "react";

export const StatCard = ({ title, value, className = "" }: { title: string; value: React.ReactNode; className?: string }) => {
  return (
    <div className={`card flex flex-col items-center justify-center gap-1 ${className}`}>
      <div className="text-2xl font-extrabold text-slate-900 leading-none">{value}</div>
      <div className="text-xs font-semibold text-slate-600">{title}</div>
    </div>
  );
};

