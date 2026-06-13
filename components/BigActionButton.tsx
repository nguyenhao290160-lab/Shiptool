import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";
}

export const BigActionButton = ({ children, variant = "primary", className = "", ...props }: Props) => {
  const base =
    "w-full py-4 px-5 rounded-2xl text-base font-bold flex items-center gap-3 transition-all duration-200 active:scale-[0.97]";

  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/25",
    secondary:
      "bg-white text-slate-800 border border-slate-200/80 hover:border-cyan-300 hover:bg-cyan-50/50 shadow-sm hover:shadow-md",
    success:
      "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20",
    danger:
      "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/20",
    outline:
      "bg-white text-slate-700 border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 shadow-sm hover:shadow-md",
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      <span className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
        variant === "primary"
          ? "bg-white/20"
          : variant === "success"
            ? "bg-white/20"
            : variant === "danger"
              ? "bg-white/20"
              : "bg-slate-100 text-cyan-600"
      }`}>
        {React.Children.toArray(children).find(
          (child) => React.isValidElement(child) && (child.type === "svg" || (typeof child.type === "string" && child.type === "svg"))
        )}
      </span>
      <span className="flex-1 text-left">
        {React.Children.toArray(children).filter(
          (child) => !(React.isValidElement(child) && (child.type === "svg" || (typeof child.type === "string" && child.type === "svg")))
        )}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 shrink-0 ${variant === "primary" || variant === "success" || variant === "danger" ? "text-white/50" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};
