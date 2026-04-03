"use client";

import { SessionProvider } from "next-auth/react";
import { Navbar } from "./navbar";
import type { Role } from "@/generated/prisma";

export function DashboardClient({
  userName,
  role,
  children,
}: {
  userName: string;
  role: Role;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Navbar userName={userName} />
      {children}
    </SessionProvider>
  );
}
