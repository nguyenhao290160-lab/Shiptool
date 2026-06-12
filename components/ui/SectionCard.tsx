import React from "react";

export const SectionCard = ({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) => {
  return (
    <section className={`card ${className}`}>
      {title && <h3 className="font-bold text-slate-900 mb-3">{title}</h3>}
      <div>{children}</div>
    </section>
  );
};

