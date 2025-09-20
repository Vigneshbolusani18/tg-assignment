import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCredits, fetchNotifications, toggleNotifications,
  hideNotifications, markAllRead, selectUnreadCount,
} from "../../features/ui/uiSlice";
import { logoutThunk } from "../../features/auth/authSlice";

const Svg = {
  Coins:(p)=>(
    <svg viewBox="0 0 24 24" className="w-4 h-4 block" fill="none" stroke="#4b6bff" strokeWidth="1.6" {...p}>
      <path d="M12 6.5c4.1 0 7.5-1.1 7.5-2.5S16.1 1.5 12 1.5 4.5 2.6 4.5 4 7.9 6.5 12 6.5Z"/>
      <path d="M19.5 4v4c0 1.4-3.4 2.5-7.5 2.5S4.5 9.4 4.5 8V4"/>
      <path d="M19.5 8v4c0 1.4-3.4 2.5-7.5 2.5S4.5 13.4 4.5 12V8"/>
    </svg>
  ),
  Bell:(p)=>(<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#1f2a44" strokeWidth="1.6" {...p}><path d="M9 17a3 3 0 006 0"/><path d="M5 17h14l-1.4-1.4A2 2 0 0117 14v-3a5 5 0 10-10 0v3a2 2 0 01-.6 1.4L5 17Z" strokeLinejoin="round"/></svg>),
  User:(p)=>(<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#7b89b0" strokeWidth="1.6" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0116 0"/></svg>),
  Cog:(p)=>(<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#7b89b0" strokeWidth="1.4" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a8 8 0 00.1-2 8 8 0 00-.1-2l1.9-1.4-1.9-3.2-2.2.8a8 8 0 00-2.6-1.5L14 2h-4l-.6 2.7A8 8 0 006.8 6L4.6 5.4 2.7 8.6 4.6 10a8 8 0 000 4l-1.9 1.4 1.9 3.2 2.2-.8a8 8 0 002.6 1.5L10 22h4l.6-2.7a8 8 0 002.6-1.5l2.2.8 1.9-3.2L19.4 15Z" opacity=".6"/></svg>),
  SignOut:(p)=>(<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#b91c1c" strokeWidth="1.6" {...p}><path d="M15 12H3"/><path d="M7 8 3 12l4 4" strokeLinejoin="round"/><path d="M11 4h4a3 3 0 013 3v10a3 3 0 01-3 3h-4" stroke="#9ca3af" strokeWidth="1.2"/></svg>),
  Caret:(p)=>(<svg viewBox="0 0 20 20" className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M6 8l4 4 4-4"/></svg>)
};

export default function Topbar(){
  const dispatch = useDispatch();
  const { user } = useSelector(s=>s.auth);
  const { credits, notificationsOpen, notifications, loadingNotifs } = useSelector(s=>s.ui);
  const unread = useSelector(selectUnreadCount) || 0;

  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null), notifBtnRef = useRef(null);
  const profileRef = useRef(null), profileBtnRef = useRef(null);

  useEffect(()=>{ dispatch(fetchCredits()); },[dispatch]);

  const onBellClick = () => {
    if (notificationsOpen) dispatch(hideNotifications());
    else {
      dispatch(toggleNotifications());
      if ((notifications || []).length === 0) dispatch(fetchNotifications());
      setProfileOpen(false);
    }
  };

  useEffect(()=>{
    const onDoc=(e)=>{
      if (notificationsOpen &&
          !notifRef.current?.contains(e.target) &&
          !notifBtnRef.current?.contains(e.target)) {
        dispatch(hideNotifications());
      }
      if (profileOpen &&
          !profileRef.current?.contains(e.target) &&
          !profileBtnRef.current?.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const onEsc=(e)=>{ if(e.key==='Escape'){ notificationsOpen&&dispatch(hideNotifications()); profileOpen&&setProfileOpen(false); } };
    document.addEventListener('mousedown',onDoc); document.addEventListener('keydown',onEsc);
    return ()=>{ document.removeEventListener('mousedown',onDoc); document.removeEventListener('keydown',onEsc); };
  },[notificationsOpen,profileOpen,dispatch]);

  const username = user?.username ?? "User";

  return (
    <header className="h-16 bg-white border-b border-[#eef0f4] flex items-center justify-between px-6">
      {/* LEFT: product label exactly like the ref */}
      <div className="text-[18px] font-semibold text-slate-900">AI Chat</div>

      {/* RIGHT cluster (unchanged functionality) */}
      <div className="flex items-center gap-4">
        <div className="inline-flex items-center justify-center gap-2 h-10 px-3 rounded-[22px] bg-white shadow-[inset_0_0_0_1px_#E6ECFF]">
          <Svg.Coins />
          <span className="text-[15px] font-medium text-[#1f2a44] leading-none tabular-nums">
            {Number.isFinite(credits)?credits.toLocaleString():credits??0}
          </span>
        </div>

        <button ref={notifBtnRef} onClick={onBellClick} className="relative grid place-items-center w-10 h-10 rounded-full bg-[#f3f6ff] hover:shadow-sm">
          <Svg.Bell/>{unread>0&&(<span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-[#3b82f6] text-white grid place-items-center">{unread>99?"99+":unread}</span>)}
        </button>

        <button
          ref={profileBtnRef}
          onClick={()=>{ setProfileOpen(v=>!v); if (notificationsOpen) dispatch(hideNotifications()); }}
          className="flex items-center gap-2 pl-1 pr-2 h-10 rounded-full hover:bg-[#f6f7fb]"
        >
          <span className="grid place-items-center w-10 h-10 rounded-full bg-[#4b6bff]">
            <Svg.User stroke="#ffffff" />
          </span>
          <span className="text-[15px] text-slate-900 font-medium hidden sm:block">{username}</span>
          <Svg.Caret/>
        </button>

        {notificationsOpen&&(
          <div ref={notifRef} className="absolute right-40 top-16 w-[380px] max-h-[60vh] overflow-auto bg-white border border-[#eef0f4] rounded-2xl shadow-xl p-3 z-50">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-slate-800">Notifications</div>
              <button className="text-xs text-blue-600 hover:underline disabled:opacity-50" onClick={()=>dispatch(markAllRead())} disabled={unread===0}>Mark all read</button>
            </div>
            {loadingNotifs&&<div className="p-3 text-sm text-slate-500">Loading…</div>}
            {!loadingNotifs&&(notifications||[]).length===0&&<div className="p-3 text-sm text-slate-500">No notifications</div>}
            <div className="space-y-2">
              {(notifications||[]).map(n=>{
                const dot = n?.color ? n.color
                  : (n?.title||"").toLowerCase().includes("welcome") ? "bg-green-500"
                  : n?.read ? "bg-gray-300" : "bg-blue-500";
                const created = n?.createdAt ? new Date(n.createdAt).toLocaleString() : "";
                return (
                  <div key={n.id} className="rounded-xl border border-[#eef0f4] p-3 flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${dot}`}/>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">{n?.title||"Notification"}</div>
                      {n?.body&&<div className="text-sm text-slate-600">{n.body}</div>}
                      <div className="text-[11px] text-slate-400 mt-1">{created}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {profileOpen&&(
          <div ref={profileRef} className="absolute right-6 top-16 w-[280px] bg-white border border-[#eef0f4] rounded-2xl shadow-xl overflow-hidden z-50">
            <div className="flex items-center gap-3 px-4 h-12 text-slate-800"><Svg.User/><span className="truncate">{username}</span></div>
            <hr className="border-[#eef0f4]"/>
            <button className="w-full flex items-center gap-3 px-4 h-12 hover:bg-[#f7f9ff] text-left text-slate-800" onClick={()=>setProfileOpen(false)}><Svg.Cog/><span>Settings</span></button>
            <hr className="border-[#eef0f4]"/>
            <button className="w-full flex items-center gap-3 px-4 h-12 hover:bg-[#f7f9ff] text-left text-slate-800" onClick={()=>dispatch(logoutThunk())}><Svg.SignOut/><span>Sign Out</span></button>
          </div>
        )}
      </div>
    </header>
  );
}
