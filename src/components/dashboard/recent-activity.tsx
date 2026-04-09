"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  PhoneIcon,
  MailIcon,
  MessageCircleIcon,
  UsersIcon,
  StickyNoteIcon,
  NewspaperIcon,
} from "lucide-react";

interface RecentActivityItem {
  id: string;
  type: string;
  subject: string | null;
  content: string;
  date: string | Date;
  client: { id: string; name: string };
}

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; variant: "default" | "secondary" | "outline" }> = {
  CALL: { icon: PhoneIcon, label: "שיחה", variant: "default" },
  EMAIL: { icon: MailIcon, label: "מייל", variant: "secondary" },
  WHATSAPP: { icon: MessageCircleIcon, label: "וואטסאפ", variant: "default" },
  MEETING: { icon: UsersIcon, label: "פגישה", variant: "secondary" },
  NOTE: { icon: StickyNoteIcon, label: "הערה", variant: "outline" },
  MAILING: { icon: NewspaperIcon, label: "דיוור", variant: "outline" },
};

function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();

  // Future dates or negative diff — show absolute date
  if (diff < 0) {
    return d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 60) return `לפני ${Math.max(minutes, 1)} דקות`;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) return `לפני ${hours} שעות`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `לפני ${days} ימים`;

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `לפני ${weeks} שבועות`;
  }

  // Older than 30 days — show absolute date
  return d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function RecentActivity({ activities }: { activities: RecentActivityItem[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">פעילות אחרונה</h2>
      </div>
      {activities.length === 0 ? (
        <p className="text-sm text-slate-400 p-6 text-center">אין פעילות אחרונה</p>
      ) : (
        <div className="divide-y divide-slate-50">
          {activities.map((a) => {
            const config = typeConfig[a.type] ?? typeConfig.NOTE;
            const Icon = config.icon;
            return (
              <div key={a.id} className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    <Icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/clients/${a.client.id}`}
                        className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors"
                      >
                        {a.client.name}
                      </Link>
                      <Badge variant={config.variant} className="text-[10px] px-1.5 py-0">
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {a.subject ?? a.content.slice(0, 60)}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0 mt-1">
                    {timeAgo(a.date)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
