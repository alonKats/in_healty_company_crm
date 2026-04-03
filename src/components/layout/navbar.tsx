"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Navbar({ userName }: { userName: string }) {
  return (
    <header className="fixed top-0 right-56 left-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{userName}</span>
        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
