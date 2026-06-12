"use client";

import React from "react";

type AlertType = "warning" | "info" | "offline";

interface AlertBoxProps {
  type: AlertType;
  title: string;
  message: string;
}

export function AlertBox({ type, title, message }: AlertBoxProps) {
  const typeConfig = {
    warning: {
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-600",
      titleColor: "text-yellow-900",
      messageColor: "text-yellow-800",
      icon: "⚠️",
    },
    info: {
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      titleColor: "text-blue-900",
      messageColor: "text-blue-800",
      icon: "ℹ️",
    },
    offline: {
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      iconColor: "text-orange-600",
      titleColor: "text-orange-900",
      messageColor: "text-orange-800",
      icon: "📡",
    },
  };

  const config = typeConfig[type];

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-2xl p-4 flex items-start gap-3`}>
      <div className={`text-xl mt-1 flex-shrink-0`}>{config.icon}</div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-sm ${config.titleColor}`}>{title}</h3>
        <p className={`text-sm ${config.messageColor} mt-1`}>{message}</p>
      </div>
    </div>
  );
}
