import React from "react";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const SummaryCard = ({ title, value, subtitle, icon }: Props) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col justify-center">
      <p className="text-sm text-slate-600 font-medium mb-1">{title}</p>
      <div className="flex items-center justify-between">
        <p className="text-3xl font-black text-slate-900">{value}</p>
        {icon && <div className="text-orange-600 bg-orange-50 p-2 rounded-full">{icon}</div>}
      </div>
      {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
    </div>
  );
};
