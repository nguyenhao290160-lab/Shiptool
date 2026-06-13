"use client";

import React from "react";
import { LocalDataStatusCard } from "./LocalDataStatusCard";

interface Props {
  onDataImported?: () => void;
}

export const LocalDataBackupPanel = ({ onDataImported }: Props) => {
  return (
    <div className="card-premium space-y-4">
      <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-lg">💾</span>
        Dữ liệu & sao lưu
      </h2>
      <LocalDataStatusCard onRefresh={onDataImported} />
    </div>
  );
};
