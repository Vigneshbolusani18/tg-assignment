// src/components/layout/Topbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCredits,
  fetchNotifications,
  toggleNotifications, // still used for the bell; can open your notif panel if you add one
} from "../../features/ui/uiSlice";
import { logoutThunk } from "../../features/auth/authSlice";

// tiny svg icons (keeps markup clean)
const IconCoins = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 6.5c4.142 0 7.5-1.12 7.5-2.5S16.142 1.5 12 1.5 4.5 2.62 4.5 4 7.858 6.5 12 6.5Z" />
    <path d="M19.5 4v4c0 1.38-3.358 2.5-7.5 2.5S4.5 9.38 4.5 8V4" />
    <path d="M19.5 8v4c0 1.38-3.358 2.5-7.5 2.5S4.5 13.38 4.5 12V8" />
  </svg>
);

const IconBell = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14v-3a6 6 0 10-12 0v3a2 2 0 01-.6 1.4L4 17h5" />
    <path d="M9 17a3 3 0 006 0" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 12a5 5 0 100-10 5 5 0 000 10Z" />
    <path d="M20 21a8 8 0 10-16 0" />
  </svg>
);

const IconCog = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10.325 4.317a1 1 0 011.35 0l.823.708a8.04 8.04 0 012.33.675l1.06-.354a1 1 0 011.264.63l.41 1.192c.344.3.66.636.94 1.004l1.218.1a1 1 0 01.93 1.092l-.11 1.22c.21.74.21 1.514 0 2.254l.11 1.22a1 1 0 01-.93 1.092l-1.218.1a7.96 7.96 0 01-.94 1.004l-.41 1.192a1 1 0 01-1.264.63l-1.06-.354a8.04 8.04 0 01-2.33.675l-.823.708a1 1 0 01-1.35 0l-.823-.708a8.04 8.04 0 01-2.33-.675l-1.06.354a1 1 0 01-1.264-.63l-.41-1.192a7.96 7.96 0 01-.94-1.004l-1.218-.1a1 1 0 01-.93-1.092l.11-1.22a6.3 6.3 0 010-2.254l-.11-1.22A1 1 0 013.9 8.272l1.218-.1c.28-.368.596-.704.94-1.004l.41-1.192a1 1 0 011.264-.63l1.06.354c.747-.31 1.534-.542 2.33-.675l.823-.708z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconSignOut = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M15 7l5 5-5 5" />
    <path d="M20 12H9" />
    <path d="M12 19a7 7 0 110-14" />
  </svg>
);

export default function Topbar() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { credits, notifications } = useSelector((s) => s.ui);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  // load credits + notifications on mount
  useEffect(() => {
    dispatch(fetchCredits());
    dispatch(fetchNotifications());
  }, [dispatch]);

  // close on outside click / escape
  useEffect(() => {
    const onClick = (e) => {
      if (!menuOpen) return;
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const notifCount = notifications?.length ?? 0;
  const username = user?.username ?? "User";

  return (
    <header className="h-16 bg-white border-b border-[#eef0f4] flex items-center justify-between px-6">
      {/* left spacer or app title if you need */}
      <div className="text-[18px] font-semibold text-slate-900">AI Chat</div>

      {/* right cluster */}
      <div className="flex items-center gap-4 relative">
        {/* credits pill */}
        <div className="flex items-center gap-2 bg-[#f3f6ff] text-[#1f2a44] rounded-2xl px-4 h-10 shadow-[0_0_0_1px_#e8ecf6_inset]">
          <span className="text-[#4b6bff]"><IconCoins /></span>
          <span className="text-[15px] font-medium">{credits?.toLocaleString?.() ?? credits}</span>
        </div>

        {/* bell + badge */}
        <button
          onClick={() => dispatch(toggleNotifications())}
          className="relative grid place-items-center w-10 h-10 rounded-full bg-[#f3f6ff] text-slate-700 hover:shadow-sm transition"
          aria-label="Notifications"
          title="Notifications"
        >
          <IconBell />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#3b82f6] text-white text-[11px] grid place-items-center">
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
        </button>

        {/* avatar + name + caret */}
        <button
          ref={btnRef}
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 pl-1 pr-2 h-10 rounded-full hover:bg-[#f6f7fb] transition"
        >
          <span className="grid place-items-center w-10 h-10 rounded-full bg-[#4b6bff] text-white font-semibold">
            {username.slice(0, 1).toUpperCase()}
          </span>
          <span className="text-[15px] text-slate-900 font-medium hidden sm:block">
            {username}
          </span>
          <svg viewBox="0 0 20 20" className="w-4 h-4 text-slate-500">
            <path d="M6 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>

        {/* dropdown */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 top-12 w-[280px] bg-white border border-[#eef0f4] rounded-2xl shadow-xl overflow-hidden z-50"
          >
            {/* profile row */}
            <div className="flex items-center gap-3 px-4 h-12 text-slate-800">
              <span className="text-slate-500"><IconUser /></span>
              <span className="truncate">{username}</span>
            </div>
            <hr className="border-[#eef0f4]" />
            {/* settings */}
            <button
              className="w-full flex items-center gap-3 px-4 h-12 hover:bg-[#f7f9ff] text-left text-slate-800"
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-slate-500"><IconCog /></span>
              <span>Settings</span>
            </button>
            <hr className="border-[#eef0f4]" />
            {/* sign out */}
            <button
              className="w-full flex items-center gap-3 px-4 h-12 hover:bg-[#f7f9ff] text-left text-slate-800"
              onClick={() => dispatch(logoutThunk())}
            >
              <span className="text-slate-500"><IconSignOut /></span>
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
