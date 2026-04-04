"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { EditActivityDialog } from "./edit-activity-dialog";
import { deleteActivity } from "@/lib/actions/activity-actions";
import { PencilIcon, Trash2Icon } from "lucide-react";
import type { Activity, User } from "@/generated/prisma";

interface ActivityWithUser extends Activity {
  createdBy: Pick<User, "id" | "name">;
}

interface ActivityFeedProps {
  activities: ActivityWithUser[];
  clientId: string;
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

interface ActivityItemProps {
  activity: ActivityWithUser;
  clientId: string;
}

function ActivityItem({ activity, clientId }: ActivityItemProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteActivity(activity.id, clientId);
      setDeleteOpen(false);
    });
  }

  return (
    <>
      <div className="group relative flex flex-col gap-1.5 rounded-lg border p-3 text-sm">
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
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setEditOpen(true)}
              title="עריכה"
            >
              <PencilIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeleteOpen(true)}
              title="מחיקה"
              className="text-destructive hover:text-destructive"
            >
              <Trash2Icon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        {activity.subject && (
          <p className="font-medium">{activity.subject}</p>
        )}
        <p className="text-muted-foreground whitespace-pre-line">{activity.content}</p>
        <p className="text-xs text-muted-foreground">
          נוצר על ידי: {activity.createdBy.name}
        </p>
      </div>

      <EditActivityDialog
        activity={activity}
        clientId={clientId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="מחיקת פעילות"
        description="האם אתה בטוח שברצונך למחוק פעילות זו? פעולה זו אינה הפיכה."
        isPending={isPending}
      />
    </>
  );
}

export function ActivityFeed({ activities, clientId }: ActivityFeedProps) {
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
        <ActivityItem key={activity.id} activity={activity} clientId={clientId} />
      ))}
    </div>
  );
}
