import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCredits, fetchNotifications, toggleNotifications } from "../../features/ui/uiSlice";
import { logoutThunk } from "../../features/auth/authSlice";

export default function Topbar(){
  const dispatch = useDispatch();
  const { user } = useSelector(s=>s.auth);
  const { credits, notificationsOpen, notifications } = useSelector(s=>s.ui);

  useEffect(()=>{ dispatch(fetchCredits()); dispatch(fetchNotifications()); }, [dispatch]);

  return (
    <header className="h-16 bg-white border-b border-[#eef0f4] flex items-center justify-between px-6 relative">
      <div className="text-slate-700">Welcome, <span className="font-medium text-slate-900">{user?.username}</span></div>
      <div className="flex items-center gap-4">
        <span className="text-slate-600 text-sm">Credits: <b className="text-slate-900">{credits}</b></span>
        <button onClick={()=>dispatch(toggleNotifications())} className="relative">
          <span className="inline-block w-9 h-9 rounded-full bg-[#eef3ff] grid place-items-center">🔔</span>
        </button>
        <button className="px-3 h-9 rounded-lg bg-[#3b82f6] text-white text-sm" onClick={()=>dispatch(logoutThunk())}>Logout</button>
      </div>

      {notificationsOpen && (
        <div className="absolute right-6 top-16 w-[360px] bg-white border border-[#eef0f4] rounded-2xl shadow-xl p-3 z-50">
          <div className="font-semibold mb-2 text-slate-800">Notifications</div>
          <div className="space-y-2 max-h-80 overflow-auto">
            {notifications.length===0 && <div className="text-slate-500 text-sm">No notifications</div>}
            {notifications.map(n=>(
              <div key={n.id} className="rounded-xl border border-[#eef0f4] p-3">
                <div className="text-sm text-slate-800">{n.message}</div>
                <div className="text-xs text-slate-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
