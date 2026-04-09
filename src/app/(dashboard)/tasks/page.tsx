import { getAllTasks, getTaskStats } from "@/lib/queries/task-queries";
import { getClients } from "@/lib/queries/client-queries";
import { TaskList } from "@/components/tasks/task-list";
import { serialize } from "@/lib/utils";
import type { SerializedTask, ClientOption } from "@/components/tasks/task-list";

export default async function TasksPage() {
  const [tasks, stats, clients] = await Promise.all([
    getAllTasks(),
    getTaskStats(),
    getClients(),
  ]);

  const clientOptions = clients.map((c) => ({
    id: c.id,
    name: c.name,
    company: c.company,
  }));

  return (
    <TaskList
      tasks={serialize(tasks) as unknown as SerializedTask[]}
      stats={stats}
      clients={serialize(clientOptions) as unknown as ClientOption[]}
    />
  );
}
