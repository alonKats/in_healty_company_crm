"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function Navbar({ userName }: { userName: string }) {
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : "?";

  return (
    <header className="fixed top-0 left-0 right-[220px] h-16 flex items-center justify-between px-8 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Left side: search placeholder */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-xs">
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="חיפוש במערכת..."
            className="w-full bg-slate-100 border-none rounded-lg py-2 pr-10 pl-4 text-sm focus:ring-2 focus:ring-teal-600/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right side: user + logout */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm font-bold text-slate-800">{userName}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">מנהל מערכת</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center border border-teal-200">
          <span className="text-teal-700 font-bold text-sm">{initials}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-slate-400 hover:text-red-500 transition-colors"
          title="התנתק"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
