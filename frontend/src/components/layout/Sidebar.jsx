// src/components/layout/Sidebar.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadConversations, setCurrent, createConversation } from "../../features/chat/chatSlice";

const ChevronLeft = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevronRight = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export default function Sidebar() {
  const dispatch = useDispatch();
  const { conversations = [], currentId, loading } = useSelector((s) => s.chat || {});
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => { dispatch(loadConversations()); }, [dispatch]);
  const onNew = () => dispatch(createConversation());

  return (
    <aside
      className={`relative h-full shrink-0 bg-white border-r border-[#eef0f4] flex flex-col transition-[width] duration-200 ${
        collapsed ? "w-[72px]" : "w-80"
      }`}
    >
      {/* Header */}
      <div className={`h-16 px-6 flex items-center ${collapsed ? "justify-center" : ""}`}>
        {!collapsed ? (
          <h2 className="text-[18px] font-semibold text-slate-900">Conversations</h2>
        ) : (
          <span className="sr-only">Conversations</span>
        )}

        <button
          onClick={() => setCollapsed(true)}
          aria-label="Collapse sidebar"
          className={`absolute top-3 -right-3 w-7 h-7 rounded-full bg-white border border-[#e6eaf5] shadow-sm grid place-items-center ${
            collapsed ? "opacity-0 pointer-events-none" : ""
          }`}
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* New Chat */}
      {!collapsed && (
        <div className="px-3">
          <button
            onClick={onNew}
            className="w-full h-11 rounded-2xl bg-gradient-to-r from-[#4e6ef1] to-[#2f65f6] text-white font-medium shadow-sm hover:shadow-[0_6px_20px_-8px_rgba(79,106,242,.6)] transition"
          >
            + New Chat
          </button>
          <div className="text-sm text-slate-500 mt-4 px-2">Conversations</div>
        </div>
      )}

      {/* List (independent scroll) */}
      <div className={`${collapsed ? "px-2 pb-3" : "px-3 pb-4"} mt-2 space-y-1 flex-1 overflow-auto`}>
        {loading && <div className="pt-10 text-center text-slate-500 text-sm">Loading…</div>}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => dispatch(setCurrent(c.id))}
            className={`w-full text-left rounded-xl transition ${
              collapsed
                ? "p-3 grid place-items-center hover:bg-[#f5f7fb]"
                : `px-3 py-3 hover:bg-[#f5f7fb] ${currentId === c.id ? "bg-[#eef3ff]" : ""}`
            }`}
            title={collapsed ? c.title : undefined}
          >
            {collapsed ? (
              <span className="w-5 h-5 rounded-[6px] border border-[#e6eaf5] bg-[#f8faff] inline-block" />
            ) : (
              <>
                <div className="font-medium text-slate-800 truncate">{c.title}</div>
                <div className="text-xs text-slate-400 truncate">{c.preview || ""}</div>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Expand floater when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          className="absolute top-3 -right-3 w-7 h-7 rounded-full bg-white border border-[#e6eaf5] shadow-sm grid place-items-center"
        >
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      )}
    </aside>
  );
}
