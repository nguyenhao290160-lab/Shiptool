import React from "react";

interface Props {
  children: React.ReactNode;
}

export const BottomActionBar = ({ children }: Props) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] max-w-md mx-auto z-20 flex gap-2">
      {children}
    </div>
  );
};
