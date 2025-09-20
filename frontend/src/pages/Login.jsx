import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import Card from "../features/ui/Card";
import Input from "../features/ui/Input";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector(s => s.auth);

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginThunk(form));
    if (res.meta.requestStatus === "fulfilled") navigate("/");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-[#f8fbff] to-[#f3f6fb]">
      <Card
        title="Sign In"
        subtitle="Enter your credentials to access your account"
        footer={
          <p className="text-center text-slate-500 text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-[#2f6bff] hover:underline">Sign up</Link>
          </p>
        }
      >
        <form onSubmit={onSubmit}>
          <Input
            label="Username"
            value={form.username}
            placeholder="your_name"
            onChange={(e)=>setForm({...form, username:e.target.value})}
          />
          <Input
            label="Password"
            type={showPwd ? "text":"password"}
            value={form.password}
            placeholder="••••••••"
            onChange={(e)=>setForm({...form, password:e.target.value})}
            rightIcon={<span role="img" aria-label="eye">👁️</span>}
            onRightIconClick={()=>setShowPwd(v=>!v)}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button type="submit" className="w-full h-12 rounded-xl bg-[#3b82f6] text-white font-medium mt-3">
            Sign In
          </button>
        </form>
      </Card>
    </div>
  );
}
