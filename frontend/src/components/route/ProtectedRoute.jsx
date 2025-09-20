import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { bootstrap } from "../../features/auth/authSlice";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useSelector(s=>s.auth);
  const dispatch = useDispatch();

  useEffect(()=>{ if(loading && !user) dispatch(bootstrap()); }, [dispatch, loading, user]);

  if (loading) return <div className="p-6 text-slate-300">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}
