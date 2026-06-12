import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";
}

export const BigActionButton = ({ children, variant = "primary", className = "", ...props }: Props) => {
  const baseStyles = "w-full py-4 px-6 rounded-2xl text-lg font-bold shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800",
    secondary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
    outline: "border-2 border-slate-300 text-slate-800 bg-white hover:bg-slate-50 active:bg-slate-100",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
