"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, ShoppingCart, Calendar, Package, UserCheck, Wallet, Settings, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/generated/prisma";

const navItems = [
  { href: "/", label: "לוח בקרה", icon: LayoutDashboard },
  { href: "/clients", label: "לקוחות", icon: Users },
  { href: "/quotes", label: "הצעות מחיר", icon: FileText },
  { href: "/orders", label: "הזמנות", icon: ShoppingCart },
  { href: "/calendar", label: "לוח שנה", icon: Calendar },
  { href: "/services", label: "מוצרים", icon: Package },
  { href: "/providers", label: "ספקים", icon: UserCheck },
  { href: "/expenses", label: "הוצאות", icon: Wallet },
  { href: "/settings", label: "הגדרות", icon: Settings, adminOnly: true },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="fixed right-0 top-0 z-50 h-screen w-[220px] flex flex-col bg-teal-600 border-l border-teal-700/50 shadow-xl overflow-y-auto overflow-x-hidden">
      {/* Logo area */}
      <div className="p-6 flex flex-col items-center gap-2 border-b border-teal-500/30">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-inner">
          <Leaf className="w-7 h-7 text-teal-600 fill-teal-600" />
        </div>
        <div className="text-center">
          <h1 className="text-white text-xl font-bold tracking-tight">בחברה בריאה</h1>
          <p className="text-teal-100 text-[10px] opacity-80 leading-tight">ניהול בריאות ארגונית</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 mt-4 px-2 space-y-1">
        {navItems
          .filter((item) => !item.adminOnly || role === "ADMIN")
          .map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-200",
                  isActive
                    ? "text-white bg-teal-700 border-r-4 border-orange-400 font-bold"
                    : "text-teal-50 hover:bg-teal-500/50 font-medium"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
