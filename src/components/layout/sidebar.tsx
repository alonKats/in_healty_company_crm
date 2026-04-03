"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, ShoppingCart, Package, Wallet, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/generated/prisma";

const navItems = [
  { href: "/", label: "לוח בקרה", icon: LayoutDashboard },
  { href: "/clients", label: "לקוחות", icon: Users },
  { href: "/quotes", label: "הצעות מחיר", icon: FileText },
  { href: "/orders", label: "הזמנות", icon: ShoppingCart },
  { href: "/services", label: "מוצרים", icon: Package },
  { href: "/expenses", label: "הוצאות", icon: Wallet },
  { href: "/settings", label: "הגדרות", icon: Settings, adminOnly: true },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="fixed right-0 top-0 z-30 h-screen w-56 border-l" style={{ backgroundColor: "#2A9D8F", borderColor: "#227a6e" }}>
      <div className="flex h-14 items-center justify-center border-b" style={{ borderColor: "#227a6e" }}>
        <h1 className="text-lg font-bold text-white">בחברה בריאה</h1>
      </div>
      <nav className="space-y-1 p-3">
        {navItems
          .filter((item) => !item.adminOnly || role === "ADMIN")
          .map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                )}
                style={isActive ? { backgroundColor: "#3ab5a5" } : undefined}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
