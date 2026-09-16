/**
 * LifeOS AI service layer.
 *
 * This is a deterministic, local heuristic engine — not a machine-learning
 * model. It is intentionally isolated behind a small async interface so a real
 * AI API (Lovable AI, OpenAI, etc.) can be swapped in later without touching
 * any UI code: replace the bodies of `getPriorities`, `getDayPlan` and
 * `getWeeklyReview` with network calls that return the same shapes.
 */
import { differenceInCalendarDays, format, isSameDay, parseISO } from "date-fns";

import type { CalendarEvent, Goal, Habit, LifeOSState, Task } from "./types";

export interface ScoredTask {
  task: Task;
  score: number;
  level: "High" | "Medium" | "Low";
  factors: { label: string; value: number; detail: string }[];
  reason: string;
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

function deadlineUrgency(task: Task): { value: number; detail: string } {
  if (!task.dueDate) return { value: 20, detail: "No deadline set" };
  const days = differenceInCalendarDays(parseISO(task.dueDate), new Date());
  if (days < 0) return { value: 100, detail: `Overdue by ${Math.abs(days)}d` };
  if (days === 0) return { value: 95, detail: "Due today" };
  if (days === 1) return { value: 80, detail: "Due tomorrow" };
  if (days <= 3) return { value: 60, detail: `${days} days left` };
  if (days <= 7) return { value: 40, detail: `${days} days left` };
  return { value: 22, detail: `${days} days left` };
}

function goalRelevance(task: Task, goals: Goal[]): { value: number; detail: string } {
  const goal = goals.find((g) => g.id === task.goalId);
  if (!goal) return { value: 25, detail: "Not linked to a goal" };
  return { value: 40 + goal.importance * 12, detail: `Supports "${goal.title}"` };
}

function userPriority(task: Task): { value: number; detail: string } {
  const map = { high: 95, medium: 60, low: 30 } as const;
  return { value: map[task.priority], detail: `${task.priority} priority` };
}

function effortFit(task: Task, events: CalendarEvent[]): { value: number; detail: string } {
  const minutes = task.estimate ?? 45;
  const today = task.dueDate ? parseISO(task.dueDate) : new Date();
  const busy = events
    .filter((e) => isSameDay(parseISO(e.date), today))
    .reduce((acc, e) => acc + minutesBetween(e.start, e.end), 0);
  const free = Math.max(0, 9 * 60 - busy);
  if (minutes <= free * 0.25) return { value: 80, detail: `${minutes}m fits easily` };
  if (minutes <= free * 0.6) return { value: 60, detail: `${minutes}m fits your day` };
  if (free === 0) return { value: 25, detail: "Calendar is fully booked" };
  return { value: 38, detail: `${minutes}m is tight against ${Math.round(busy / 60)}h of events` };
}

function contextRelevance(task: Task): { value: number; detail: string } {
  const hour = new Date().getHours();
  if (!task.dueTime) return { value: 45, detail: "Flexible timing" };
  const taskHour = Number(task.dueTime.split(":")[0]);
  const delta = Math.abs(taskHour - hour);
  if (delta <= 1) return { value: 90, detail: "Scheduled for right now" };
  if (delta <= 3) return { value: 65, detail: "Coming up shortly" };
  return { value: 40, detail: `Scheduled for ${task.dueTime}` };
}

export function minutesBetween(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

const WEIGHTS = {
  deadline: 0.32,
  goal: 0.22,
  priority: 0.24,
  context: 0.12,
  effort: 0.1,
};

export function scoreTask(task: Task, state: Pick<LifeOSState, "goals" | "events">): ScoredTask {
  const deadline = deadlineUrgency(task);
  const goal = goalRelevance(task, state.goals);
  const priority = userPriority(task);
  const context = contextRelevance(task);
  const effort = effortFit(task, state.events);

  const score = clamp(
    Math.round(
      deadline.value * WEIGHTS.deadline +
        goal.value * WEIGHTS.goal +
        priority.value * WEIGHTS.priority +
        context.value * WEIGHTS.context +
        effort.value * WEIGHTS.effort,
    ),
  );

  const level = score >= 72 ? "High" : score >= 50 ? "Medium" : "Low";

  const factors = [
    { label: "Deadline urgency", value: deadline.value, detail: deadline.detail },
    { label: "Goal relevance", value: goal.value, detail: goal.detail },
    { label: "Your priority", value: priority.value, detail: priority.detail },
    { label: "Context", value: context.value, detail: context.detail },
    { label: "Effort & schedule fit", value: effort.value, detail: effort.detail },
  ];

  const top = [...factors].sort((a, b) => b.value - a.value)[0];
  const reason =
    top.label === "Goal relevance"
      ? `${goal.detail} and it's ${deadline.detail.toLowerCase()}.`
      : `${top.detail}${task.goalId ? `, and it moves "${state.goals.find((g) => g.id === task.goalId)?.title}" forward` : ""}.`;

  return { task, score, level, factors, reason };
}

export function rankTasks(state: LifeOSState): ScoredTask[] {
  return state.tasks
    .filter((t) => !t.completed)
    .map((t) => scoreTask(t, state))
    .sort((a, b) => b.score - a.score);
}

export interface PlanBlock {
  id: string;
  period: "Morning" | "Afternoon" | "Evening";
  time: string;
  title: string;
  kind: "focus" | "task" | "meeting" | "habit" | "break";
  detail: string;
  why?: string;
}

export interface DayPlan {
  generatedAt: string;
  blocks: PlanBlock[];
  summary: string;
}

function periodFor(hour: number): PlanBlock["period"] {
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export function buildDayPlan(state: LifeOSState, seed = 0): DayPlan {
  const ranked = rankTasks(state);
  const today = format(new Date(), "yyyy-MM-dd");
  const todaysEvents = state.events
    .filter((e) => e.date === today)
    .sort((a, b) => a.start.localeCompare(b.start));

  const blocks: PlanBlock[] = [];

  const deepWork = ranked[seed % Math.max(1, ranked.length)];
  if (deepWork) {
    blocks.push({
      id: "plan-deep",
      period: "Morning",
      time: "09:00 – 10:30",
      title: deepWork.task.title,
      kind: "focus",
      detail: `Deep work · ${deepWork.task.estimate ?? 60} min · ${deepWork.task.category}`,
      why: deepWork.reason,
    });
  }

  const second = ranked[(seed + 1) % Math.max(1, ranked.length)];
  if (second && second.task.id !== deepWork?.task.id) {
    blocks.push({
      id: "plan-second",
      period: "Morning",
      time: "10:45 – 11:30",
      title: second.task.title,
      kind: "task",
      detail: `${second.level} AI priority · ${second.task.category}`,
      why: second.reason,
    });
  }

  todaysEvents.forEach((e) => {
    blocks.push({
      id: `plan-${e.id}`,
      period: periodFor(Number(e.start.split(":")[0])),
      time: `${e.start} – ${e.end}`,
      title: e.title,
      kind: e.kind === "focus" ? "focus" : e.kind === "habit" ? "habit" : "meeting",
      detail: e.location ? `Calendar · ${e.location}` : "From your calendar",
    });
  });

  const admin = ranked.find((r) => r.level !== "High" && r.task.category !== "Health");
  if (admin) {
    blocks.push({
      id: "plan-admin",
      period: "Afternoon",
      time: "15:00 – 15:45",
      title: admin.task.title,
      kind: "task",
      detail: "Admin block · lower energy window",
      why: "Batched into the afternoon so your morning stays protected for deep work.",
    });
  }

  const eveningHabits = state.habits.filter((h) => h.preferredTime === "Evening").slice(0, 2);
  eveningHabits.forEach((h, i) => {
    blocks.push({
      id: `plan-habit-${h.id}`,
      period: "Evening",
      time: `${19 + i}:00 – ${19 + i}:30`,
      title: h.name,
      kind: "habit",
      detail: `Habit routine · ${currentStreak(h)} day streak`,
      why: i === 0 ? "Your calendar is clear after 19:00, which is when you complete this most often." : undefined,
    });
  });

  const personal = ranked.find((r) => r.task.category === "Personal");
  if (personal) {
    blocks.push({
      id: "plan-personal",
      period: "Evening",
      time: "18:30 – 19:00",
      title: personal.task.title,
      kind: "task",
      detail: "Personal · low cognitive load",
    });
  }

  const order = { Morning: 0, Afternoon: 1, Evening: 2 } as const;
  blocks.sort((a, b) => order[a.period] - order[b.period] || a.time.localeCompare(b.time));

  const focusMinutes = blocks
    .filter((b) => b.kind === "focus")
    .reduce((acc, b) => acc + 90, 0);

  return {
    generatedAt: new Date().toISOString(),
    blocks,
    summary: `${blocks.length} blocks · ~${Math.round(focusMinutes / 60)}h protected focus · ${todaysEvents.length} calendar commitments.`,
  };
}

export function currentStreak(habit: Habit): number {
  const set = new Set(habit.completions);
  let streak = 0;
  const cursor = new Date();
  // allow today to be incomplete without breaking the streak
  if (!set.has(format(cursor, "yyyy-MM-dd"))) cursor.setDate(cursor.getDate() - 1);
  for (;;) {
    const key = format(cursor, "yyyy-MM-dd");
    if (!set.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function bestStreak(habit: Habit): number {
  const sorted = [...habit.completions].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const day of sorted) {
    const date = parseISO(day);
    if (prev && differenceInCalendarDays(date, prev) === 1) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = date;
  }
  return best;
}

export interface WeeklyReview {
  completed: number;
  postponed: number;
  habitConsistency: number;
  goalsProgressed: number;
  focusHours: number;
  insights: string[];
}

export function buildWeeklyReview(state: LifeOSState): WeeklyReview {
  const completed = state.tasks.filter((t) => t.completed).length;
  const open = state.tasks.filter((t) => !t.completed).length;
  const postponed = state.tasks.filter(
    (t) => !t.completed && t.dueDate && differenceInCalendarDays(parseISO(t.dueDate), new Date()) < 0,
  ).length;

  const last7 = Array.from({ length: 7 }, (_, i) => format(new Date(Date.now() - i * 86400000), "yyyy-MM-dd"));
  const possible = state.habits.length * 7;
  const done = state.habits.reduce(
    (acc, h) => acc + h.completions.filter((c) => last7.includes(c)).length,
    0,
  );
  const habitConsistency = possible ? Math.round((done / possible) * 100) : 0;
  const rate = completed + open ? Math.round((completed / (completed + open)) * 100) : 0;

  const bestHabit = [...state.habits].sort((a, b) => currentStreak(b) - currentStreak(a))[0];
  const heaviestGoal = [...state.goals].sort((a, b) => b.importance - a.importance)[0];

  return {
    completed,
    postponed,
    habitConsistency,
    goalsProgressed: state.goals.filter((g) => g.progress > 0 && g.status !== "completed").length,
    focusHours: Math.round((completed * 42) / 60),
    insights: [
      `You closed ${rate}% of the tasks on your plate this week.`,
      bestHabit
        ? `${bestHabit.name} is your steadiest habit at a ${currentStreak(bestHabit)}-day streak.`
        : "Add a habit to start tracking consistency.",
      postponed > 0
        ? `${postponed} task${postponed > 1 ? "s have" : " has"} slipped past its due date — consider rescheduling rather than carrying it.`
        : "Nothing slipped past its due date. Keep the load where it is.",
      heaviestGoal
        ? `"${heaviestGoal.title}" is your highest-leverage goal — protect one morning block for it next week.`
        : "Set a goal so LifeOS can weigh your tasks against it.",
    ],
  };
}

/* ---- async facade: swap these for real API calls later ---- */

export async function getPriorities(state: LifeOSState): Promise<ScoredTask[]> {
  return rankTasks(state);
}

export async function getDayPlan(state: LifeOSState, seed = 0): Promise<DayPlan> {
  await new Promise((r) => setTimeout(r, 650));
  return buildDayPlan(state, seed);
}

export async function getWeeklyReview(state: LifeOSState): Promise<WeeklyReview> {
  return buildWeeklyReview(state);
}
