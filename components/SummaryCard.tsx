import React from "react";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const SummaryCard = ({ title, value, subtitle, icon }: Props) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-center" style={{ boxShadow: "var(--shadow-sm)" }}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{title}</p>
      <div className="flex items-center justify-between">
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        {icon && (
          <div className="text-orange-500 bg-orange-50 p-2.5 rounded-xl border border-orange-100">
            {icon}
          </div>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
    </div>
  );
};
