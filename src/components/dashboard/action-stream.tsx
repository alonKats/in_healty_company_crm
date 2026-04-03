import Link from "next/link";
import type { ActionItem } from "@/lib/queries/dashboard-queries";

const urgencyConfig: Record<
  ActionItem["urgency"],
  { bg: string; border: string; dot: string; text: string }
> = {
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    text: "text-red-700",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-500",
    text: "text-orange-700",
  },
  yellow: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  gray: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-400",
    text: "text-slate-600",
  },
};

export function ActionStream({ items }: { items: ActionItem[] }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-5">
        <svg
          className="w-5 h-5 text-teal-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <h2 className="text-lg font-bold text-slate-800">פעולות נדרשות</h2>
        {items.length > 0 && (
          <span className="mr-auto text-xs font-medium bg-teal-100 text-teal-700 rounded-full px-2 py-0.5">
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">
          אין פעולות נדרשות כרגע. הכל מסודר!
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const cfg = urgencyConfig[item.urgency];
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:shadow-sm ${cfg.bg} ${cfg.border}`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium shrink-0 ${cfg.text}`}
                  >
                    {item.actionLabel}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
