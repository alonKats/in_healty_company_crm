import { Badge } from "@/components/ui/badge";
import type { Activity, User } from "@/generated/prisma";

interface ActivityWithUser extends Activity {
  createdBy: Pick<User, "id" | "name">;
}

interface ActivityFeedProps {
  activities: ActivityWithUser[];
}

const typeLabels: Record<string, string> = {
  CALL: "שיחה",
  EMAIL: "מייל",
  WHATSAPP: "וואטסאפ",
  MEETING: "פגישה",
  NOTE: "הערה",
  MAILING: "דיוור",
};

const directionLabels: Record<string, string> = {
  INBOUND: "נכנס",
  OUTBOUND: "יוצא",
};

const typeVariants: Record<string, "default" | "secondary" | "outline"> = {
  CALL: "default",
  EMAIL: "secondary",
  WHATSAPP: "default",
  MEETING: "secondary",
  NOTE: "outline",
  MAILING: "outline",
};

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        אין פעילויות עדיין
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex flex-col gap-1.5 rounded-lg border p-3 text-sm"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={typeVariants[activity.type] ?? "outline"}>
              {typeLabels[activity.type] ?? activity.type}
            </Badge>
            <Badge variant="outline">
              {directionLabels[activity.direction] ?? activity.direction}
            </Badge>
            <span className="text-muted-foreground text-xs ml-auto">
              {formatDate(activity.date)}
            </span>
          </div>
          {activity.subject && (
            <p className="font-medium">{activity.subject}</p>
          )}
          <p className="text-muted-foreground whitespace-pre-line">{activity.content}</p>
          <p className="text-xs text-muted-foreground">
            נוצר על ידי: {activity.createdBy.name}
          </p>
        </div>
      ))}
    </div>
  );
}
