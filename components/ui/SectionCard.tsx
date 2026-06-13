import React from "react";

export const SectionCard = ({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) => {
  return (
    <section className={`card-premium ${className}`}>
      {title && (
        <h3 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2.5">
          <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-cyan-500 to-cyan-600 inline-block" />
          {title}
        </h3>
      )}
      <div>{children}</div>
    </section>
  );
};
