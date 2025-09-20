import React from "react";

const Row = ({ ok, text }) => (
  <div className={`flex items-center gap-2 text-sm ${ok ? "text-green-600" : "text-red-500"}`}>
    <span>{ok ? "✓" : "✗"}</span>
    <span>{text}</span>
  </div>
);

export default function PasswordChecklist({ pwd }) {
  const rules = {
    len: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    lower: /[a-z]/.test(pwd),
    digit: /\d/.test(pwd),
  };
  return (
    <div className="space-y-1.5 mt-2">
      <Row ok={rules.len}   text="At least 8 characters" />
      <Row ok={rules.upper} text="One uppercase letter" />
      <Row ok={rules.lower} text="One lowercase letter" />
      <Row ok={rules.digit} text="One number" />
    </div>
  );
}
