import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadConversations, setCurrent } from "../../features/chat/chatSlice";

export default function Sidebar(){
  const dispatch = useDispatch();
  const { conversations, currentId } = useSelector(s=>s.chat);

  useEffect(()=>{ dispatch(loadConversations()); }, [dispatch]);

  return (
    <aside className="w-80 bg-white border-r border-[#eef0f4] px-3 py-4">
      <button className="w-full h-11 rounded-xl bg-[#3b82f6] text-white font-medium">+ New Chat</button>
      <div className="text-sm text-slate-500 mt-4 px-2">Conversations</div>
      <div className="mt-2 space-y-1">
        {conversations.map(c=>(
          <button key={c.id}
            onClick={()=>dispatch(setCurrent(c.id))}
            className={`w-full text-left px-3 py-3 rounded-xl hover:bg-[#f5f7fb] ${currentId===c.id?"bg-[#eef3ff]":""}`}>
            <div className="font-medium text-slate-800 truncate">{c.title}</div>
            <div className="text-xs text-slate-400">{new Date(c.lastMessageAt).toLocaleString()}</div>
          </button>
        ))}
      </div>
    </aside>
  );
}
