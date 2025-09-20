import React from "react";

export default function Card({ title, subtitle, children, footer }) {
  return (
    <div className="w-[440px] max-w-[92vw] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,.08)] border border-[#eef0f4]">
      <div className="px-8 pt-8 pb-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="px-8 pb-6">{children}</div>
      {footer && <div className="px-8 pb-8">{footer}</div>}
    </div>
  );
}
