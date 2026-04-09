"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Zap,
  Plus,
} from "lucide-react";
import { completeTask, dismissTask } from "@/lib/actions/task-actions";
import { CreateTaskDialog } from "./create-task-dialog";

// --- Types ---

interface TaskClient {
  id: string;
  name: string;
  company: string | null;
}

interface TaskAssignee {
  id: string;
  name: string;
}

export interface SerializedTask {
  id: string;
  clientId: string | null;
  client: TaskClient | null;
  assignedTo: TaskAssignee | null;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  trigger: string;
  relatedType: string | null;
  relatedId: string | null;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientOption {
  id: string;
  name: string;
  company: string | null;
}

interface TaskStats {
  pending: number;
  overdue: number;
  completedThisWeek: number;
}

interface TaskListProps {
  tasks: SerializedTask[];
  stats: TaskStats;
  clients: ClientOption[];
}

// --- Label maps ---

const typeLabels: Record<string, string> = {
  FOLLOW_UP: "מעקב",
  SEND_QUOTE: "שליחת הצעה",
  PAYMENT_REMINDER: "תזכורת תשלום",
  EVENT_PREP: "הכנה לאירוע",
  RE_ENGAGEMENT: "חידוש קשר",
  GENERAL: "כללי",
};

const priorityLabels: Record<string, string> = {
  HIGH: "גבוהה",
  MEDIUM: "בינונית",
  LOW: "נמוכה",
};

const priorityColors: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-orange-100 text-orange-700",
  LOW: "bg-slate-100 text-slate-600",
};

const typeColors: Record<string, string> = {
  FOLLOW_UP: "bg-blue-100 text-blue-700",
  SEND_QUOTE: "bg-purple-100 text-purple-700",
  PAYMENT_REMINDER: "bg-amber-100 text-amber-700",
  EVENT_PREP: "bg-teal-100 text-teal-700",
  RE_ENGAGEMENT: "bg-indigo-100 text-indigo-700",
  GENERAL: "bg-slate-100 text-slate-600",
};

const priorityOrder: Record<string, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

// --- Helpers ---

function isOverdue(task: SerializedTask): boolean {
  if (!task.dueDate || task.status !== "PENDING") return false;
  return new Date(task.dueDate) < new Date();
}

function isAutoTriggered(trigger: string): boolean {
  return trigger !== "MANUAL";
}

function relativeDueDate(dueDateStr: string | null): string {
  if (!dueDateStr) return "";
  const due = new Date(dueDateStr);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "היום";
  if (diffDays === 1) return "מחר";
  if (diffDays === -1) return "אתמול";
  if (diffDays > 1) return `בעוד ${diffDays} ימים`;
  return `באיחור של ${Math.abs(diffDays)} ימים`;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("he-IL");
}

// --- Component ---

export function TaskList({ tasks, stats, clients }: TaskListProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleComplete(taskId: string) {
    startTransition(async () => {
      await completeTask(taskId);
    });
  }

  function handleDismiss(taskId: string) {
    startTransition(async () => {
      await dismissTask(taskId);
    });
  }

  // Sort by priority then due date
  function sortTasks(list: SerializedTask[]): SerializedTask[] {
    return [...list].sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 2;
      const pb = priorityOrder[b.priority] ?? 2;
      if (pa !== pb) return pa - pb;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
  }

  const pendingTasks = sortTasks(tasks.filter((t) => t.status === "PENDING"));
  const overdueTasks = sortTasks(tasks.filter((t) => t.status === "PENDING" && isOverdue(t)));
  const completedTasks = tasks
    .filter((t) => t.status === "COMPLETED")
    .sort((a, b) => new Date(b.completedAt ?? b.updatedAt).getTime() - new Date(a.completedAt ?? a.updatedAt).getTime());
  const allTasks = sortTasks(tasks.filter((t) => t.status !== "DISMISSED"));

  function renderTaskCard(task: SerializedTask) {
    const overdue = isOverdue(task);
    const auto = isAutoTriggered(task.trigger);
    const completed = task.status === "COMPLETED";

    return (
      <Card
        key={task.id}
        className={cn(
          "p-4 flex flex-col gap-3 transition-colors",
          overdue && "border-red-300 bg-red-50/50",
          completed && "opacity-70"
        )}
      >
        {/* Top row: title + badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={cn("font-semibold text-sm", completed && "line-through text-muted-foreground")}>
                {task.title}
              </h3>
              {auto && (
                <span className="text-amber-500 flex items-center gap-0.5 text-xs">
                  <Zap className="h-3 w-3" />
                  <span>אוטומטי</span>
                </span>
              )}
            </div>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Badge className={cn("text-[10px]", priorityColors[task.priority])}>
              {priorityLabels[task.priority] ?? task.priority}
            </Badge>
            <Badge className={cn("text-[10px]", typeColors[task.type])}>
              {typeLabels[task.type] ?? task.type}
            </Badge>
          </div>
        </div>

        {/* Bottom row: client, due date, actions */}
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-3 flex-wrap">
            {task.client && (
              <Link
                href={`/clients/${task.client.id}`}
                className="text-teal-600 hover:underline font-medium"
              >
                {task.client.name}
              </Link>
            )}
            {task.dueDate && (
              <span className={cn("flex items-center gap-1", overdue && "text-red-600 font-medium")}>
                {overdue ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {relativeDueDate(task.dueDate)}
                <span className="text-muted-foreground">({formatDate(task.dueDate)})</span>
              </span>
            )}
            {completed && task.completedAt && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                הושלם {formatDate(task.completedAt)}
              </span>
            )}
          </div>

          {/* Action buttons — only for pending tasks */}
          {task.status === "PENDING" && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleComplete(task.id)}
                disabled={isPending}
                title="סמן כהושלם"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                onClick={() => handleDismiss(task.id)}
                disabled={isPending}
                title="בטל משימה"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  function renderEmptyState(message: string) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">משימות</h2>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          משימה חדשה
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{stats.pending}</div>
          <div className="text-xs text-muted-foreground mt-1">ממתינות</div>
        </Card>
        <Card className={cn("p-4 text-center", stats.overdue > 0 && "border-red-300 bg-red-50/50")}>
          <div className={cn("text-2xl font-bold", stats.overdue > 0 ? "text-red-600" : "text-slate-900")}>
            {stats.overdue}
          </div>
          <div className="text-xs text-muted-foreground mt-1">באיחור</div>
        </Card>
        <Card className="p-4 text-center border-green-200 bg-green-50/30">
          <div className="text-2xl font-bold text-green-600">{stats.completedThisWeek}</div>
          <div className="text-xs text-muted-foreground mt-1">הושלמו השבוע</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="all">הכל ({allTasks.length})</TabsTrigger>
          <TabsTrigger value="pending">ממתינות ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="overdue">
            <span className={cn(overdueTasks.length > 0 && "text-red-600")}>
              באיחור ({overdueTasks.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed">הושלמו ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-3 mt-4">
            {allTasks.length > 0
              ? allTasks.map(renderTaskCard)
              : renderEmptyState("אין משימות")}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-3 mt-4">
            {pendingTasks.length > 0
              ? pendingTasks.map(renderTaskCard)
              : renderEmptyState("אין משימות ממתינות")}
          </div>
        </TabsContent>

        <TabsContent value="overdue">
          <div className="space-y-3 mt-4">
            {overdueTasks.length > 0
              ? overdueTasks.map(renderTaskCard)
              : renderEmptyState("אין משימות באיחור")}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-3 mt-4">
            {completedTasks.length > 0
              ? completedTasks.map(renderTaskCard)
              : renderEmptyState("אין משימות שהושלמו")}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create dialog */}
      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        clients={clients}
      />
    </div>
  );
}
