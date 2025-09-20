import React from "react";

export default function WelcomePanel({ onPick }) {
  const starters = [
    "Explain quantum computing in simple terms",
    "Write a Python function to sort a list",
    "What are the benefits of meditation?",
    "Help me plan a weekend trip to Paris",
  ];

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center px-6 -mt-10">
        <div className="mx-auto w-12 h-12 rounded-full bg-[#e9efff] grid place-items-center mb-4">
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="#4b6bff" strokeWidth="1.6">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-slate-900">Welcome to AI Chat</h1>
        <p className="mt-2 text-slate-500 max-w-[720px]">
          Start a conversation with our AI assistant. Ask questions, get help with tasks, or explore ideas together.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-[920px] mx-auto">
          {starters.map((t, i) => (
            <button
              key={i}
              onClick={() => onPick?.(t)}
              className="w-full bg-white rounded-2xl border border-[#e7ecf6] shadow-sm hover:shadow transition px-4 h-14 flex items-center gap-3 text-[15px]"
            >
              <span className="inline-block w-5 h-5 rounded-md border border-[#e7ecf6]" />
              <span className="truncate">{t}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
