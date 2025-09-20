import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerThunk } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import Card from "../features/ui/Card";
import Input from "../features/ui/Input";
import PasswordChecklist from "../features/ui/PasswordChecklist";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector(s => s.auth);

  const pwdOk = form.password.length >= 8 &&
    /[A-Z]/.test(form.password) &&
    /[a-z]/.test(form.password) &&
    /\d/.test(form.password);
  const matchOk = form.password && form.password === form.confirm;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!pwdOk || !matchOk) return;
    const res = await dispatch(registerThunk({ username: form.username, password: form.password }));
    if (res.meta.requestStatus === "fulfilled") navigate("/");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-[#f8fbff] to-[#f3f6fb]">
      <Card
        title="Sign Up"
        subtitle="Create an account to get started"
        footer={
          <p className="text-center text-slate-500 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-[#2f6bff] hover:underline">Sign in</Link>
          </p>
        }
      >
        <form onSubmit={onSubmit}>
          <Input
            label="Username"
            placeholder="your_name"
            value={form.username}
            onChange={(e)=>setForm({...form, username:e.target.value})}
          />
          <Input
            label="Password"
            type={showPwd ? "text":"password"}
            placeholder="••••••••"
            value={form.password}
            onChange={(e)=>setForm({...form, password:e.target.value})}
            rightIcon={<span role="img" aria-label="eye">👁️</span>}
            onRightIconClick={()=>setShowPwd(v=>!v)}
          />
          <PasswordChecklist pwd={form.password} />
          <div className={`mt-3 ${matchOk || !form.confirm ? "text-green-600":"text-red-500"} text-sm`}>
            {form.confirm ? (matchOk ? "Passwords match" : "Passwords do not match") : " "}
          </div>
          <Input
            label="Confirm Password"
            type={showPwd2 ? "text":"password"}
            placeholder="••••••••"
            value={form.confirm}
            onChange={(e)=>setForm({...form, confirm:e.target.value})}
            rightIcon={<span role="img" aria-label="eye">👁️</span>}
            onRightIconClick={()=>setShowPwd2(v=>!v)}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="mt-3 w-full h-12 rounded-xl bg-[#3b82f6] text-white font-medium disabled:opacity-50"
            disabled={!pwdOk || !matchOk || !form.username}
          >
            Sign Up
          </button>
        </form>
      </Card>
    </div>
  );
}
