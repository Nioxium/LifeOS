import { eachDayOfInterval, format, startOfMonth, endOfMonth, subDays } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { HabitCard } from "@/components/lifeos/cards";
import {
  EmptyState,
  Panel,
  PanelHeader,
  SectionTitle,
  StatTile,
} from "@/components/lifeos/primitives";
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
import { Switch } from "@/components/ui/switch";
import { bestStreak, currentStreak } from "@/lib/lifeos/ai";
import { useLifeOS } from "@/lib/lifeos/store";
import type { Habit, HabitFrequency } from "@/lib/lifeos/types";
import { cn } from "@/lib/utils";

function Heatmap({ habit }: { habit: Habit }) {
  const days = eachDayOfInterval({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) });
  const set = new Set(habit.completions);
  return (
    <div className="flex flex-wrap gap-1">
      {days.map((d) => {
        const key = format(d, "yyyy-MM-dd");
        const done = set.has(key);
        const future = key > format(new Date(), "yyyy-MM-dd");
        return (
          <span
            key={key}
            title={`${format(d, "d MMM")}${done ? " · done" : ""}`}
            className={cn(
              "size-4 rounded-[4px] border border-border transition-colors",
              done
                ? "border-transparent bg-[var(--olive)]"
                : future
                  ? "bg-[var(--ivory)]"
                  : "bg-[var(--sand)]/35",
            )}
          />
        );
      })}
    </div>
  );
}

function NewHabitDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { addHabit } = useLifeOS();
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [preferredTime, setPreferredTime] = useState<Habit["preferredTime"]>("Morning");
  const [goalPerWeek, setGoalPerWeek] = useState("5");
  const [reminder, setReminder] = useState(true);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>New habit</DialogTitle>
          <DialogDescription>Start with one small thing you can repeat.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="habit-name">Habit name</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Morning walk"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as HabitFrequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekdays">Weekdays</SelectItem>
                  <SelectItem value="3x-week">3× per week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Preferred time</Label>
              <Select
                value={preferredTime}
                onValueChange={(v) => setPreferredTime(v as Habit["preferredTime"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Morning", "Afternoon", "Evening", "Anytime"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="habit-goal">Goal per week</Label>
              <Input
                id="habit-goal"
                type="number"
                min={1}
                max={7}
                value={goalPerWeek}
                onChange={(e) => setGoalPerWeek(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="habit-start">Start date</Label>
              <Input
                id="habit-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <div>
              <p className="text-[14px] font-medium">Reminder</p>
              <p className="text-[12px] text-muted-foreground">Nudge me at my preferred time</p>
            </div>
            <Switch checked={reminder} onCheckedChange={setReminder} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!name.trim()) {
                toast.error("Give the habit a name first.");
                return;
              }
              addHabit({
                name: name.trim(),
                icon: "Leaf",
                frequency,
                preferredTime,
                goalPerWeek: Number(goalPerWeek) || 5,
                reminder,
                startDate,
              });
              toast.success("Habit created");
              setName("");
              onOpenChange(false);
            }}
          >
            Create habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function HabitsPage() {
  const { state, deleteHabit } = useLifeOS();
  const [open, setOpen] = useState(false);

  const last30 = Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), i), "yyyy-MM-dd"));
  const monthly = state.habits.length
    ? Math.round(
        (state.habits.reduce(
          (acc, h) => acc + h.completions.filter((c) => last30.includes(c)).length,
          0,
        ) /
          (state.habits.length * 30)) *
          100,
      )
    : 0;
  const topStreak = state.habits.length ? Math.max(...state.habits.map(currentStreak)) : 0;
  const allTimeBest = state.habits.length ? Math.max(...state.habits.map(bestStreak)) : 0;
  const week = state.habits.length
    ? Math.round(
        (state.habits.reduce(
          (acc, h) =>
            acc +
            h.completions.filter((c) => c >= format(subDays(new Date(), 6), "yyyy-MM-dd")).length,
          0,
        ) /
          (state.habits.length * 7)) *
          100,
      )
    : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div>
          <SectionTitle>Habits</SectionTitle>
          <p className="mt-1.5 text-[14px] text-muted-foreground">Consistency compounds quietly.</p>
        </div>
        <Button className="rounded-full" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New habit
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Current streak"
          value={`${topStreak} days`}
          hint="Your strongest active habit"
        />
        <StatTile label="Weekly completion" value={`${week}%`} hint="Across all habits" />
        <StatTile label="Monthly consistency" value={`${monthly}%`} hint="Last 30 days" />
        <StatTile label="Best streak" value={`${allTimeBest} days`} hint="All time" />
      </div>

      {state.habits.length === 0 ? (
        <Panel>
          <EmptyState
            title="Build your routine"
            description="Start with one small habit."
            action={
              <Button className="rounded-full" onClick={() => setOpen(true)}>
                Create a habit
              </Button>
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {state.habits.map((habit) => (
            <Panel key={habit.id}>
              <PanelHeader
                title={habit.name}
                description={`${habit.frequency} · ${habit.preferredTime} · goal ${habit.goalPerWeek}×/week`}
                action={
                  <button
                    type="button"
                    aria-label={`Delete ${habit.name}`}
                    onClick={() => deleteHabit(habit.id)}
                    className="ring-focus rounded-md p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                }
              />
              <div className="space-y-4 px-5 pb-5">
                <HabitCard habit={habit} compact />
                <div>
                  <p className="mb-2 text-[12px] tracking-wide text-muted-foreground uppercase">
                    {format(new Date(), "MMMM")} consistency
                  </p>
                  <Heatmap habit={habit} />
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <NewHabitDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
