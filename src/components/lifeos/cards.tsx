import { Link } from "react-router-dom";
import { format, formatDistanceToNow, isToday, parseISO, subDays } from "date-fns";
import { Flame } from "lucide-react";

import { ProgressBar, Tag } from "@/components/lifeos/primitives";
import { currentStreak } from "@/lib/lifeos/ai";
import { useLifeOS } from "@/lib/lifeos/store";
import type { CalendarEvent, Goal, Habit, Note } from "@/lib/lifeos/types";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function weekDays(): string[] {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // Monday = 0
  return Array.from({ length: 7 }, (_, i) => format(subDays(today, dow - i), "yyyy-MM-dd"));
}

export function HabitCard({ habit, compact = false }: { habit: Habit; compact?: boolean }) {
  const { toggleHabitDay } = useLifeOS();
  const days = weekDays();
  const done = days.filter((d) => habit.completions.includes(d)).length;
  const pct = Math.round((done / 7) * 100);
  const todayStr = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="surface-hover rounded-xl border border-border bg-card px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[14.5px] font-medium text-foreground">{habit.name}</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Flame className="size-3.5 text-[var(--olive)]" />
            {currentStreak(habit)} day streak
            <span className="text-[var(--sand)]">·</span>
            {pct}% this week
          </p>
        </div>
        {!compact ? (
          <span className="rounded-full bg-[var(--ivory)] px-2 py-0.5 text-[11px] text-muted-foreground">
            {habit.preferredTime}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {days.map((day, i) => {
          const complete = habit.completions.includes(day);
          const isFuture = day > todayStr;
          return (
            <button
              key={day}
              type="button"
              disabled={isFuture}
              aria-label={`${DAY_LABELS[i]} ${habit.name}`}
              onClick={() => toggleHabitDay(habit.id, day)}
              className={cn(
                "ring-focus flex flex-1 flex-col items-center gap-1 rounded-lg py-1 text-[10px] transition-all duration-200",
                isFuture ? "opacity-40" : "hover:bg-[var(--ivory)]",
              )}
            >
              <span className="text-muted-foreground">{DAY_LABELS[i]}</span>
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border text-[10px] transition-all duration-200",
                  complete
                    ? "border-[var(--olive)] bg-[var(--olive)] text-[var(--warm-white)]"
                    : "border-border text-transparent",
                )}
              >
                ✓
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const statusTone: Record<Goal["status"], string> = {
  "on-track": "bg-[var(--sage)] text-[var(--olive-deep)]",
  "at-risk": "bg-[var(--sand)] text-[var(--olive-deep)]",
  completed: "bg-[var(--olive)] text-[var(--warm-white)]",
};

export function GoalCard({
  goal,
  tone = "olive",
}: {
  goal: Goal;
  tone?: "olive" | "sage" | "sand";
}) {
  const { state } = useLifeOS();
  const linked = state.tasks.filter((t) => t.goalId === goal.id).length;

  return (
    <Link
      to="/goals"
      className="surface-hover ring-focus block rounded-xl border border-border bg-card px-4 py-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-medium text-foreground">{goal.title}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {linked} linked task{linked === 1 ? "" : "s"} · due{" "}
            {format(parseISO(goal.deadline), "d MMM")}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
            statusTone[goal.status],
          )}
        >
          {goal.status.replace("-", " ")}
        </span>
      </div>
      <div className="mt-3.5 flex items-center gap-3">
        <ProgressBar value={goal.progress} tone={tone} />
        <span className="w-9 shrink-0 text-right text-[12px] font-medium text-foreground">
          {goal.progress}%
        </span>
      </div>
    </Link>
  );
}

const eventTone: Record<CalendarEvent["kind"], string> = {
  meeting: "bg-[var(--olive)]",
  focus: "bg-[var(--olive-deep)]",
  habit: "bg-[var(--sage)]",
  personal: "bg-[var(--sand)]",
};

export function EventRow({ event }: { event: CalendarEvent }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[var(--ivory)]">
      <span className="w-[52px] shrink-0 text-[12px] tabular-nums text-muted-foreground">
        {event.start}
      </span>
      <span className={cn("h-7 w-[3px] shrink-0 rounded-full", eventTone[event.kind])} />
      <div className="min-w-0">
        <p className="truncate text-[14px] text-foreground">{event.title}</p>
        {event.location ? (
          <p className="text-[11px] text-muted-foreground">{event.location}</p>
        ) : null}
      </div>
    </div>
  );
}

export function DayGroupLabel({ date }: { date: string }) {
  const parsed = parseISO(date);
  return (
    <p className="px-2 pt-3 pb-1 text-[12px] font-medium tracking-wide text-[var(--sage)] uppercase">
      {isToday(parsed) ? "Today" : format(parsed, "EEEE d MMM")}
    </p>
  );
}

export function NoteCard({ note, onClick }: { note: Note; onClick?: (() => void) | undefined }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="surface-hover ring-focus w-full rounded-xl border border-border bg-card px-4 py-3.5 text-left"
    >
      <p className="text-[14.5px] font-medium text-foreground">{note.title}</p>
      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
        {note.content}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {note.tags.slice(0, 3).map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
        <span className="ml-auto text-[11px] text-muted-foreground">
          {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
        </span>
      </div>
    </button>
  );
}
