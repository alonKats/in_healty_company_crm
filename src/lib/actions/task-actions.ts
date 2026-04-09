"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type {
  TaskType,
  TaskPriority,
  TaskStatus,
  TaskTrigger,
} from "@/generated/prisma";

interface CreateTaskData {
  clientId?: string;
  title: string;
  description?: string;
  type?: string;
  priority?: TaskPriority;
  dueDate?: Date | string;
  assignedToId?: string;
  trigger?: TaskTrigger;
  relatedType?: string;
  relatedId?: string;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: Date | string | null;
  priority?: TaskPriority;
  assignedToId?: string | null;
  status?: TaskStatus;
}

interface AutoTaskEvent {
  type:
    | "QUOTE_SENT"
    | "QUOTE_EXPIRED"
    | "ORDER_CREATED"
    | "EVENT_COMPLETED"
    | "PAYMENT_OVERDUE";
  clientId: string;
  relatedId: string;
  relatedType: string;
}

interface AutoTaskConfig {
  title: string;
  taskType: TaskType;
  daysUntilDue: number;
  priority: TaskPriority;
  trigger: TaskTrigger;
}

const AUTO_TASK_CONFIG: Record<AutoTaskEvent["type"], AutoTaskConfig> = {
  QUOTE_SENT: {
    title: "מעקב אחרי הצעת מחיר",
    taskType: "FOLLOW_UP",
    daysUntilDue: 5,
    priority: "HIGH",
    trigger: "AUTO_QUOTE_SENT",
  },
  QUOTE_EXPIRED: {
    title: "הצעת מחיר פגה — ליצור קשר מחדש",
    taskType: "RE_ENGAGEMENT",
    daysUntilDue: 1,
    priority: "MEDIUM",
    trigger: "AUTO_QUOTE_EXPIRED",
  },
  ORDER_CREATED: {
    title: "הכנה לאירוע — אישור לוגיסטיקה",
    taskType: "EVENT_PREP",
    daysUntilDue: 7,
    priority: "HIGH",
    trigger: "AUTO_ORDER_CREATED",
  },
  EVENT_COMPLETED: {
    title: "מעקב אחרי אירוע — משוב ומכירה נוספת",
    taskType: "FOLLOW_UP",
    daysUntilDue: 3,
    priority: "MEDIUM",
    trigger: "AUTO_EVENT_COMPLETED",
  },
  PAYMENT_OVERDUE: {
    title: "תזכורת תשלום",
    taskType: "PAYMENT_REMINDER",
    daysUntilDue: 0,
    priority: "HIGH",
    trigger: "AUTO_PAYMENT_OVERDUE",
  },
};

export async function createTask(data: CreateTaskData) {
  const dueDate = data.dueDate ? new Date(data.dueDate) : undefined;

  await prisma.task.create({
    data: {
      clientId: data.clientId ?? null,
      title: data.title,
      description: data.description ?? null,
      type: (data.type as TaskType) ?? "GENERAL",
      priority: data.priority ?? "MEDIUM",
      dueDate: dueDate ?? null,
      assignedToId: data.assignedToId ?? null,
      trigger: data.trigger ?? "MANUAL",
      relatedType: data.relatedType ?? null,
      relatedId: data.relatedId ?? null,
    },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function completeTask(taskId: string) {
  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function dismissTask(taskId: string) {
  await prisma.task.update({
    where: { id: taskId },
    data: { status: "DISMISSED" },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function updateTask(taskId: string, data: UpdateTaskData) {
  const dueDate =
    data.dueDate !== undefined
      ? data.dueDate === null
        ? null
        : new Date(data.dueDate)
      : undefined;

  await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(dueDate !== undefined && { dueDate }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.assignedToId !== undefined && {
        assignedToId: data.assignedToId,
      }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function deleteTask(taskId: string) {
  await prisma.task.delete({ where: { id: taskId } });

  revalidatePath("/");
  revalidatePath("/tasks");
}

export async function triggerAutoTasks(event: AutoTaskEvent) {
  const config = AUTO_TASK_CONFIG[event.type];

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + config.daysUntilDue);

  await prisma.task.create({
    data: {
      clientId: event.clientId,
      title: config.title,
      type: config.taskType,
      priority: config.priority,
      status: "PENDING",
      trigger: config.trigger,
      dueDate,
      relatedType: event.relatedType,
      relatedId: event.relatedId,
    },
  });

  revalidatePath("/");
  revalidatePath("/tasks");
}
