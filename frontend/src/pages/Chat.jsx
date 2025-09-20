// src/pages/Chat.jsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadMessages, sendMessage } from "../features/chat/chatSlice";
import WelcomePanel from "../components/chat/WelcomePanel";

const Svg = {
  User: (p) => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0116 0" />
    </svg>
  ),
  Bot: (p) => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <rect x="4" y="7" width="16" height="10" rx="3" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <path d="M12 4v3M8 4h8" strokeLinecap="round" />
    </svg>
  ),
};

const MAX_LEN = 1000;
const MAX_LINES = 5;
const LINE_HEIGHT = 24;       // leading-6 -> 24px
const VERTICAL_PADDING = 24;  // py-3 => 12+12
const MAX_HEIGHT = MAX_LINES * LINE_HEIGHT + VERTICAL_PADDING;

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch { return ""; }
}

const Bubble = ({ role, text, created_at }) => {
  const me = role === "user";
  return (
    <div className={`mb-4 ${me ? "text-right" : "text-left"}`}>
      <div className={`flex items-center gap-2 mb-1 ${me ? "justify-end" : ""}`}>
        {!me && <span className="w-7 h-7 rounded-full bg-[#eef2ff] text-[#3450ff] grid place-items-center"><Svg.Bot /></span>}
        <span className="text-[13px] text-slate-600">{me ? "You" : "AI Assistant"}</span>
        <span className="text-[12px] text-slate-400">{formatTime(created_at)}</span>
        {me && <span className="w-7 h-7 rounded-full bg-[#4b6bff] text-white grid place-items-center"><Svg.User /></span>}
      </div>
      <div className={`inline-block max-w-[720px] rounded-2xl px-4 py-2 shadow-sm border text-left ${
        me ? "bg-[#4b6bff] text-white border-transparent" : "bg-white text-slate-800 border-[#e9eef7]"
      }`}>
        <p className="whitespace-pre-wrap text-[15px]">{text}</p>
      </div>
    </div>
  );
};

export default function Chat() {
  const dispatch = useDispatch();
  const { currentId, messages } = useSelector((s) => s.chat);
  const list = messages[currentId] || [];
  const [value, setValue] = useState("");
  const scrollerRef = useRef(null);
  const taRef = useRef(null);

  // ensure chat loads and scrolls
  useEffect(() => {
    if (currentId && !messages[currentId]) dispatch(loadMessages(currentId));
  }, [currentId, messages, dispatch]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [list.length]);

  // --- textarea auto-grow up to 5 lines ---
  const resizeTA = () => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const h = Math.min(ta.scrollHeight, MAX_HEIGHT);
    ta.style.height = `${h}px`;
    ta.style.overflowY = ta.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  };
  useEffect(() => { resizeTA(); }, [value]);
  useEffect(() => { setTimeout(resizeTA, 0); }, []); // initial fix

  const sendText = (text) => {
    const v = text.trim();
    if (!v || !currentId) return;
    setValue("");
    dispatch(sendMessage({ conversationId: currentId, text: v }));
  };
  const onSend = () => sendText(value);
  const onPickStarter = (t) => sendText(t);

  const empty = list.length === 0;
  const count = value.length;

  return (
    // FULL HEIGHT panel; messages scroll, composer fixed
    <div className="h-full rounded-2xl border border-[#eef0f4] bg-white flex flex-col">
      {/* scrollable messages */}
      <div ref={scrollerRef} className="flex-1 overflow-y-auto">
        {empty ? (
          <WelcomePanel onPick={onPickStarter} />
        ) : (
          <div className="px-6 py-6">
            <div className="max-w-[980px] mx-auto">
              {list.map((m) => (
                <Bubble key={m.id} role={m.role} text={m.text} created_at={m.created_at} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* composer (fixed within panel) */}
      <div className="border-t border-[#eef0f4] p-4">
        <div className="max-w-[980px] mx-auto">
          <div className="flex gap-2">
            <textarea
              ref={taRef}
              rows={1}
              className="flex-1 leading-6 min-h-[48px] rounded-xl bg-[#f7f8fb] border border-[#e6e8ee] px-4 py-3 outline-none focus:ring-4 focus:ring-[#e7efff] focus:border-[#6ea8ff] resize-none overflow-y-hidden"
              placeholder="Type your message..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              maxLength={MAX_LEN}
              spellCheck={true}
              style={{ maxHeight: MAX_HEIGHT }}
            />
            <button
              className="px-5 h-12 rounded-xl bg-[#4b6bff] text-white font-medium self-end disabled:opacity-50"
              onClick={onSend}
              disabled={!value.trim() || !currentId}
            >
              Send
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-[12px] text-slate-500">
            <div>Press Enter to send, Shift+Enter for new line</div>
            <div className="tabular-nums">{count}/{MAX_LEN}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
