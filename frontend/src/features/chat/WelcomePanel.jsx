// src/components/chat/WelcomePanel.jsx
import React from "react";

const Star = (p) => (
  <svg
    viewBox="0 0 64 64"
    className="w-16 h-16"
    fill="none"
    stroke="#4b6bff"
    strokeWidth="2.4"
    {...p}
  >
    <path
      d="M32 8l4.2 12.8h13.5L40 30.5l4.1 13.1L32 36.8l-12.1 6.8L24 30.5 14.3 20.8h13.5L32 8z"
      fill="#e9efff"
      strokeLinejoin="round"
    />
    <circle cx="17" cy="44" r="2.5" fill="#4b6bff" stroke="none" />
    <circle cx="51" cy="24" r="2.5" fill="#4b6bff" stroke="none" />
  </svg>
);

const Chip = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="px-5 h-[48px] rounded-2xl bg-white border border-[#e9eef7] hover:bg-[#f8faff] text-slate-800 text-[15px] shadow-[0_1px_0_#eef1f7] transition"
  >
    {children}
  </button>
);

export default function WelcomePanel({ onPick }) {
  const picks = [
    "Explain quantum computing in simple terms",
    "Write a Python function to sort a list",
    "What are the benefits of meditation?",
    "Help me plan a weekend trip to Paris",
  ];
  return (
    <div className="px-6 py-12">
      <div className="max-w-[980px] mx-auto text-center">
        <div className="grid place-items-center mb-4">
          <Star />
        </div>
        <h1 className="text-[32px] font-semibold tracking-[-0.01em] text-slate-900">
          Welcome to AI Chat
        </h1>
        <p className="text-slate-600 mt-2">
          Start a conversation with our AI assistant. Ask questions, get help
          with tasks, or explore ideas together.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mt-8 justify-items-center">
          {picks.map((t) => (
            <Chip key={t} onClick={() => onPick?.(t)}>
              {t}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
