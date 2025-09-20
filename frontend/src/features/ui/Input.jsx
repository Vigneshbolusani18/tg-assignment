import React, { useState } from "react";

export default function Input({
  label, type="text", value, onChange, placeholder, rightIcon, onRightIconClick,
}) {
  return (
    <label className="block mb-4">
      <div className="text-sm font-medium text-slate-700 mb-1">{label}</div>
      <div className="relative">
        <input
          className="w-full h-12 rounded-xl border border-[#e6e8ee] bg-[#f7f8fb] px-4 pr-11 text-[15px] outline-none focus:ring-4 focus:ring-[#e7efff] focus:border-[#6ea8ff] transition"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            aria-label="toggle"
          >
            {rightIcon}
          </button>
        )}
      </div>
    </label>
  );
}
