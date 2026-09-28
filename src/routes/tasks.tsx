import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { EmptyState, Panel, SectionTitle } from "@/components/lifeos/primitives";
import { TaskDialog } from "@/components/lifeos/task-dialog";
import { TaskItem } from "@/components/lifeos/task-item";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLifeOS } from "@/lib/lifeos/store";
import type { Task } from "@/lib/lifeos/types";

type TabKey = "all" | "today" | "upcoming" | "completed";

export default function TasksPage() {
  const { state, reorderTasks } = useLifeOS();
  const [tab, setTab] = useState<TabKey>("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const dragId = useRef<string | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");

  const filtered = useMemo(() => {
    let list = [...state.tasks].sort((a, b) => a.order - b.order);
    if (tab === "today") list = list.filter((t) => t.dueDate === today && !t.completed);
    if (tab === "upcoming")
      list = list.filter((t) => !!t.dueDate && t.dueDate > today && !t.completed);
    if (tab === "completed") list = list.filter((t) => t.completed);
    if (tab === "all") list = list.filter((t) => !t.completed);
    if (priority !== "all") list = list.filter((t) => t.priority === priority);
    if (category !== "all") list = list.filter((t) => t.category === category);
    return list;
  }, [state.tasks, tab, priority, category, today]);

  const handleDrop = (targetId: string) => {
    const sourceId = dragId.current;
    if (!sourceId || sourceId === targetId) return;
    const ids = filtered.map((t) => t.id);
    const from = ids.indexOf(sourceId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]!);
    reorderTasks(ids);
    dragId.current = null;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div>
          <SectionTitle>Tasks</SectionTitle>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            {state.tasks.filter((t) => !t.completed).length} open ·{" "}
            {state.tasks.filter((t) => t.completed).length} completed
          </p>
        </div>
        <Button
          className="rounded-full"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" /> Add task
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList className="rounded-full bg-card p-1">
            {(["all", "today", "upcoming", "completed"] as TabKey[]).map((k) => (
              <TabsTrigger key={k} value={k} className="rounded-full px-4 text-[13px] capitalize">
                {k}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="ml-auto flex gap-2">
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="h-9 w-[132px] rounded-full bg-card text-[13px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 w-[132px] rounded-full bg-card text-[13px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {["Work", "Design", "Personal", "Health", "Learning"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Panel className="px-3 py-3">
        {filtered.length === 0 ? (
          <EmptyState
            title="Your day is clear 🌿"
            description="Add something you want to accomplish today."
            action={
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setDialogOpen(true)}
              >
                Add a task
              </Button>
            }
          />
        ) : (
          filtered.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              draggable
              onDragStart={() => (dragId.current = task.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(task.id)}
              onEdit={(t) => {
                setEditing(t);
                setDialogOpen(true);
              }}
            />
          ))
        )}
      </Panel>

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editing} />
    </div>
  );
}
