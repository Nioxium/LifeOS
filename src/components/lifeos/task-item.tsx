import { format, isToday, parseISO } from "date-fns";
import { Clock, GripVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { PriorityBadge } from "@/components/lifeos/primitives";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLifeOS } from "@/lib/lifeos/store";
import type { Priority, Task } from "@/lib/lifeos/types";
import { cn } from "@/lib/utils";

function formatDue(task: Task) {
  if (!task.dueDate) return task.dueTime ?? "";
  const date = parseISO(task.dueDate);
  const day = isToday(date) ? "Today" : format(date, "EEE d MMM");
  return task.dueTime ? `${day} · ${task.dueTime}` : day;
}

export function TaskItem({
  task,
  onEdit,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  task: Task;
  onEdit?: ((task: Task) => void) | undefined;
  draggable?: boolean;
  onDragStart?: (() => void) | undefined;
  onDragOver?: ((e: React.DragEvent) => void) | undefined;
  onDrop?: (() => void) | undefined;
}) {
  const { toggleTask, deleteTask, updateTask } = useLifeOS();
  const [justChecked, setJustChecked] = useState(false);

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors duration-200 hover:border-border hover:bg-[var(--ivory)]",
        task.completed && "opacity-55",
      )}
    >
      {draggable ? (
        <GripVertical className="mt-1 size-4 shrink-0 cursor-grab text-[var(--sand)] opacity-0 transition-opacity group-hover:opacity-100" />
      ) : null}

      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}
        onClick={() => {
          if (!task.completed) setJustChecked(true);
          toggleTask(task.id);
        }}
        className={cn(
          "ring-focus mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[6px] border transition-colors duration-200",
          task.completed
            ? "border-[var(--olive)] bg-[var(--olive)]"
            : "border-[var(--sage)] hover:border-[var(--olive)]",
        )}
      >
        {task.completed ? (
          <svg
            viewBox="0 0 16 16"
            className={cn("size-3 text-[var(--warm-white)]", justChecked && "animate-check-pop")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        ) : null}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[14.5px] leading-snug font-medium text-foreground",
            task.completed && "line-through",
          )}
        >
          {task.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
          {formatDue(task) ? <span>{formatDue(task)}</span> : null}
          <span className="text-[var(--sage)]">{task.category}</span>
          {task.estimate ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {task.estimate}m
            </span>
          ) : null}
        </div>
      </div>

      <PriorityBadge priority={task.priority} className="mt-0.5 hidden sm:inline-flex" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Task options for ${task.title}`}
            className="ring-focus mt-0.5 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl">
          {onEdit ? (
            <DropdownMenuItem onSelect={() => onEdit(task)}>
              <Pencil className="size-4" /> Edit task
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[12px]">Priority</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={task.priority}
            onValueChange={(v) => updateTask(task.id, { priority: v as Priority })}
          >
            <DropdownMenuRadioItem value="high">High</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="low">Low</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => deleteTask(task.id)}>
            <Trash2 className="size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
