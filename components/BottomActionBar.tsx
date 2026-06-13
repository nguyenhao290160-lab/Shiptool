import React from "react";

interface Props {
  children: React.ReactNode;
}

export const BottomActionBar = ({ children }: Props) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 flex gap-2 md:left-64 md:p-4">
      <div className="max-w-2xl mx-auto w-full flex gap-2 px-1 justify-end">
        {children}
      </div>
    </div>
  );
};
