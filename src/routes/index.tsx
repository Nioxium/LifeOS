import { createFileRoute, Link } from "@tanstack/react-router";
import { format, isToday, parseISO } from "date-fns";
import { ArrowRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { AIPriorityHero } from "@/components/lifeos/ai-cards";
import { DayGroupLabel, EventRow, GoalCard, HabitCard, NoteCard } from "@/components/lifeos/cards";
import { EmptyState, Panel, PanelHeader } from "@/components/lifeos/primitives";
import { TaskDialog } from "@/components/lifeos/task-dialog";
import { TaskItem } from "@/components/lifeos/task-item";
import { Button } from "@/components/ui/button";
import { rankTasks } from "@/lib/lifeos/ai";
import { useLifeOS } from "@/lib/lifeos/store";
import type { Task } from "@/lib/lifeos/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LifeOS — Your calm home for tasks, habits and goals" },
      {
        name: "description",
        content:
          "LifeOS brings tasks, habits, goals, notes and calendar into one calm workspace, with an AI priority system that shows what deserves your attention today.",
      },
      { property: "og:title", content: "LifeOS — Everything in your life, organized in one calm space" },
      {
        property: "og:description",
        content: "A personal operating system for tasks, habits, goals, notes and your calendar.",
      },
    ],
  }),
  component: Overview,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Overview() {
  const { state } = useLifeOS();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const ranked = useMemo(() => rankTasks(state), [state]);
  const today = format(new Date(), "yyyy-MM-dd");

  const todaysTasks = state.tasks
    .filter((t) => t.dueDate === today)
    .sort((a, b) => Number(a.completed) - Number(b.completed) || a.order - b.order);

  const upcoming = state.events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
    .slice(0, 7);

  const grouped = upcoming.reduce<Record<string, typeof upcoming>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});

  const recentNotes = [...state.notes]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);

  const firstName = state.user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div>
          <p className="text-[12.5px] tracking-[0.14em] text-[var(--sage)] uppercase">
            {format(new Date(), "EEEE, d MMMM")}
          </p>
          <h1 className="mt-2 text-[30px] leading-tight font-semibold tracking-tight text-foreground sm:text-[34px]">
            {greeting()}, {firstName} 🌿
          </h1>
          <p className="mt-1.5 text-[14.5px] text-muted-foreground">
            Here's what deserves your attention today.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="rounded-full"
        >
          <Plus className="size-4" /> New task
        </Button>
      </header>

      <AIPriorityHero items={ranked} />

      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="lg:col-span-7">
          <PanelHeader
            title="Today"
            description={`${todaysTasks.filter((t) => !t.completed).length} open · ${todaysTasks.filter((t) => t.completed).length} done`}
            action={
              <Link
                to="/tasks"
                className="ring-focus inline-flex items-center gap-1 rounded-full px-2 py-1 text-[13px] text-[var(--olive)] hover:underline"
              >
                All tasks <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <div className="px-3 pb-4">
            {todaysTasks.length === 0 ? (
              <EmptyState
                title="Your day is clear 🌿"
                description="Add something you want to accomplish today."
                action={
                  <Button variant="outline" className="rounded-full" onClick={() => setDialogOpen(true)}>
                    Add a task
                  </Button>
                }
              />
            ) : (
              todaysTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onEdit={(t) => {
                    setEditing(t);
                    setDialogOpen(true);
                  }}
                />
              ))
            )}
          </div>
        </Panel>

        <Panel className="lg:col-span-5">
          <PanelHeader
            title="Your habits"
            description="Small things, done often."
            action={
              <Link to="/habits" className="ring-focus text-[13px] text-[var(--olive)] hover:underline">
                Manage
              </Link>
            }
          />
          <div className="space-y-2.5 px-5 pb-5">
            {state.habits.slice(0, 3).map((habit) => (
              <HabitCard key={habit.id} habit={habit} compact />
            ))}
            {state.habits.length === 0 ? (
              <EmptyState title="Build your routine" description="Start with one small habit." />
            ) : null}
          </div>
        </Panel>

        <Panel className="lg:col-span-4">
          <PanelHeader
            title="Goals"
            action={
              <Link to="/goals" className="ring-focus text-[13px] text-[var(--olive)] hover:underline">
                All
              </Link>
            }
          />
          <div className="space-y-2.5 px-5 pb-5">
            {state.goals.slice(0, 3).map((goal, i) => (
              <GoalCard key={goal.id} goal={goal} tone={i === 1 ? "sage" : i === 2 ? "sand" : "olive"} />
            ))}
            {state.goals.length === 0 ? (
              <EmptyState
                title="What are you working toward?"
                description="Create your first goal and let LifeOS break it into manageable steps."
              />
            ) : null}
          </div>
        </Panel>

        <Panel className="lg:col-span-4">
          <PanelHeader title="Upcoming" />
          <div className="px-4 pb-5">
            {Object.entries(grouped).map(([date, events]) => (
              <div key={date}>
                <DayGroupLabel date={date} />
                {events.map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </div>
            ))}
            {upcoming.length === 0 ? (
              <EmptyState title="Nothing scheduled" description="Your calendar is wide open." />
            ) : null}
            <Link
              to="/calendar"
              className="ring-focus mt-3 inline-flex items-center gap-1 px-2 text-[13px] text-[var(--olive)] hover:underline"
            >
              Open Calendar <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </Panel>

        <Panel className="lg:col-span-4">
          <PanelHeader
            title="Recent notes"
            action={
              <Link to="/notes" className="ring-focus text-[13px] text-[var(--olive)] hover:underline">
                All
              </Link>
            }
          />
          <div className="space-y-2.5 px-5 pb-5">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
            {recentNotes.length === 0 ? (
              <EmptyState title="Capture an idea" description="Your notes will live here." />
            ) : null}
          </div>
        </Panel>
      </div>

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editing} />
    </div>
  );
}

export function isTodayDate(d: string) {
  return isToday(parseISO(d));
}
