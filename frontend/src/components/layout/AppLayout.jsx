import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

export default function AppLayout(){
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900 flex flex-col">
      {/* Topbar sits alone at the very top */}
      <Topbar />

      {/* Below it: sidebar + main content in a row */}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
