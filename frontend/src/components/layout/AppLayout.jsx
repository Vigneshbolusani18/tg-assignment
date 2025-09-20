// src/components/layout/AppLayout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    // App locked to viewport height; no page scroll
    <div className="h-screen flex flex-col overflow-hidden bg-[#f5f7fb] text-slate-900">
      {/* Global top bar */}
      <Topbar />

      {/* Body row: sidebar + content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Your page content (Chat) manages its own scroll/composer */}
          <main className="flex-1 overflow-hidden p-6">
            <div className="h-full overflow-hidden">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
