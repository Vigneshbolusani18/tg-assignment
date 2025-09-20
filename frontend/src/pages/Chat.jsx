import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadMessages, sendMessage } from "../features/chat/chatSlice";

const Bubble = ({ role, text }) => {
  const me = role === "user";
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-2 my-1 shadow-sm ${me ? "bg-[#3b82f6] text-white" : "bg-white border border-[#eef0f4] text-slate-800"}`}>
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
};

export default function Chat(){
  const dispatch = useDispatch();
  const { currentId, messages } = useSelector(s=>s.chat);
  const list = messages[currentId] || [];
  const [value, setValue] = useState("");
  const scrollerRef = useRef(null);

  useEffect(()=>{ if(currentId) dispatch(loadMessages(currentId)); }, [currentId, dispatch]);
  useEffect(()=>{ scrollerRef.current?.scrollTo({ top: 999999, behavior: "smooth" }); }, [list.length]);

  const onSend = ()=>{
    const v = value.trim(); if(!v || !currentId) return;
    setValue("");
    dispatch(sendMessage({ conversationId: currentId, text: v }));
  };

  return (
    <div className="h-[calc(100vh-4rem-2.5rem)] rounded-2xl border border-[#eef0f4] bg-white flex flex-col">
      <div ref={scrollerRef} className="flex-1 overflow-y-auto p-6 space-y-1">
        {list.map(m=> <Bubble key={m.id} role={m.role} text={m.text} />)}
      </div>
      <div className="border-t border-[#eef0f4] p-4 flex gap-2">
        <input
          className="flex-1 h-12 rounded-xl bg-[#f7f8fb] border border-[#e6e8ee] px-4 outline-none focus:ring-4 focus:ring-[#e7efff] focus:border-[#6ea8ff]"
          placeholder="Type your message…"
          value={value}
          onChange={(e)=>setValue(e.target.value)}
          onKeyDown={(e)=>e.key==="Enter" && onSend()}
        />
        <button className="px-5 h-12 rounded-xl bg-[#3b82f6] text-white font-medium" onClick={onSend}>Send</button>
      </div>
    </div>
  );
}
