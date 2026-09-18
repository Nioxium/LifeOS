import { createFileRoute } from "@tanstack/react-router";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, Panel, ProgressBar, SectionTitle, Tag } from "@/components/lifeos/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { uid, useLifeOS } from "@/lib/lifeos/store";
import type { GoalCategory } from "@/lib/lifeos/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals — LifeOS" },
      {
        name: "description",
        content:
          "Break ambitions into milestones, track progress and link the tasks that move them forward.",
      },
      { property: "og:title", content: "Goals — LifeOS" },
      {
        property: "og:description",
        content: "Milestones, progress and linked tasks for every goal.",
      },
    ],
  }),
  component: GoalsPage,
});

const categories: GoalCategory[] = ["Personal", "Career", "Health", "Learning", "Finance", "Other"];

function NewGoalDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { addGoal } = useLifeOS();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory>("Personal");
  const [deadline, setDeadline] = useState("");
  const [milestones, setMilestones] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>New goal</DialogTitle>
          <DialogDescription>Name the outcome, then break it into milestones.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="goal-title">Title</Label>
            <Input id="goal-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="goal-desc">Description</Label>
            <Textarea
              id="goal-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as GoalCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="goal-deadline">Deadline</Label>
              <Input
                id="goal-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="goal-milestones">Milestones (one per line)</Label>
            <Textarea
              id="goal-milestones"
              rows={3}
              value={milestones}
              onChange={(e) => setMilestones(e.target.value)}
              placeholder={"Research\nDraft\nShip"}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!title.trim()) {
                toast.error("Give the goal a title first.");
                return;
              }
              addGoal({
                title: title.trim(),
                description: description.trim(),
                category,
                deadline: deadline || format(new Date(Date.now() + 30 * 86400000), "yyyy-MM-dd"),
                importance: 3,
                milestones: milestones
                  .split("\n")
                  .map((m) => m.trim())
                  .filter(Boolean)
                  .map((m) => ({ id: uid(), title: m, done: false })),
              });
              toast.success("Goal created");
              setTitle("");
              setDescription("");
              setMilestones("");
              onOpenChange(false);
            }}
          >
            Create goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GoalsPage() {
  const { state, toggleMilestone, deleteGoal } = useLifeOS();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<GoalCategory | "All">("All");

  const goals = state.goals.filter((g) => filter === "All" || g.category === filter);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div>
          <SectionTitle>Your goals</SectionTitle>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            The handful of things worth steady attention.
          </p>
        </div>
        <Button className="rounded-full" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New goal
        </Button>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["All", ...categories] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={cn(
              "ring-focus rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
              filter === c
                ? "border-transparent bg-[var(--olive)] text-[var(--warm-white)]"
                : "border-border bg-card text-muted-foreground hover:border-[var(--sage)]",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {goals.length === 0 ? (
        <Panel>
          <EmptyState
            title="What are you working toward?"
            description="Create your first goal and let LifeOS break it into manageable steps."
            action={
              <Button className="rounded-full" onClick={() => setOpen(true)}>
                New goal
              </Button>
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {goals.map((goal) => {
            const linked = state.tasks.filter((t) => t.goalId === goal.id);
            const daysLeft = differenceInCalendarDays(parseISO(goal.deadline), new Date());
            return (
              <Panel key={goal.id} className="px-6 py-5" hover>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Tag>{goal.category}</Tag>
                      <span className="text-[12px] text-muted-foreground">
                        {daysLeft >= 0
                          ? `${daysLeft} days left`
                          : `${Math.abs(daysLeft)} days overdue`}
                      </span>
                    </div>
                    <h2 className="mt-2 text-[18px] font-semibold tracking-tight">{goal.title}</h2>
                    <p className="mt-1 max-w-md text-[13px] leading-relaxed text-muted-foreground">
                      {goal.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Delete ${goal.title}`}
                    onClick={() => deleteGoal(goal.id)}
                    className="ring-focus rounded-md p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <ProgressBar
                    value={goal.progress}
                    tone={goal.status === "at-risk" ? "sand" : "olive"}
                  />
                  <span className="w-10 text-right text-[13px] font-medium">{goal.progress}%</span>
                </div>

                <ul className="mt-5 space-y-2">
                  {goal.milestones.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => toggleMilestone(goal.id, m.id)}
                        className="ring-focus flex w-full items-center gap-2.5 rounded-lg px-1 py-1 text-left transition-colors hover:bg-[var(--ivory)]"
                      >
                        <span
                          className={cn(
                            "flex size-[17px] shrink-0 items-center justify-center rounded-full border text-[10px]",
                            m.done
                              ? "border-[var(--olive)] bg-[var(--olive)] text-[var(--warm-white)]"
                              : "border-[var(--sage)] text-transparent",
                          )}
                        >
                          ✓
                        </span>
                        <span
                          className={cn(
                            "text-[13.5px] text-foreground",
                            m.done && "text-muted-foreground line-through",
                          )}
                        >
                          {m.title}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 border-t border-border pt-3 text-[12px] text-muted-foreground">
                  {linked.length} linked task{linked.length === 1 ? "" : "s"} · due{" "}
                  {format(parseISO(goal.deadline), "d MMM yyyy")}
                </p>
              </Panel>
            );
          })}
        </div>
      )}

      <NewGoalDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
