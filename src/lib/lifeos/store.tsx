import { format } from "date-fns";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createDemoState } from "./demo-data";
import type {
  AppNotification,
  CalendarEvent,
  Goal,
  Habit,
  LifeOSState,
  Note,
  Task,
} from "./types";

const STORAGE_KEY = "lifeos:v1";

export const uid = () => Math.random().toString(36).slice(2, 10);
export const todayKey = () => format(new Date(), "yyyy-MM-dd");

interface LifeOSContextValue {
  state: LifeOSState;
  hydrated: boolean;
  addTask: (task: Omit<Task, "id" | "order" | "createdAt" | "completed">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (ids: string[]) => void;
  addHabit: (habit: Omit<Habit, "id" | "completions">) => void;
  toggleHabitDay: (id: string, day: string) => void;
  deleteHabit: (id: string) => void;
  addGoal: (goal: Omit<Goal, "id" | "progress" | "status">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  deleteGoal: (id: string) => void;
  addNote: (note: Pick<Note, "title" | "content" | "tags">) => string;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  markNotificationsRead: () => void;
  pushNotification: (n: Omit<AppNotification, "id" | "read" | "time">) => void;
  resetDemo: () => void;
}

const LifeOSContext = createContext<LifeOSContextValue | null>(null);

export function LifeOSProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LifeOSState>(() => createDemoState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as LifeOSState);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota */
    }
  }, [state, hydrated]);

  const patch = useCallback((fn: (s: LifeOSState) => LifeOSState) => setState(fn), []);

  const value = useMemo<LifeOSContextValue>(() => {
    const recalcGoal = (goal: Goal): Goal => {
      if (!goal.milestones.length) return goal;
      const done = goal.milestones.filter((m) => m.done).length;
      return { ...goal, progress: Math.round((done / goal.milestones.length) * 100) };
    };

    return {
      state,
      hydrated,
      addTask: (task) =>
        patch((s) => ({
          ...s,
          tasks: [
            {
              ...task,
              id: uid(),
              completed: false,
              order: -1,
              createdAt: new Date().toISOString(),
            },
            ...s.tasks,
          ].map((t, i) => ({ ...t, order: i })),
        })),
      updateTask: (id, p) =>
        patch((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...p } : t)) })),
      toggleTask: (id) =>
        patch((s) => ({
          ...s,
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        })),
      deleteTask: (id) => patch((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),
      reorderTasks: (ids) =>
        patch((s) => {
          const index = new Map(ids.map((id, i) => [id, i]));
          return {
            ...s,
            tasks: s.tasks.map((t) => (index.has(t.id) ? { ...t, order: index.get(t.id)! } : t)),
          };
        }),
      addHabit: (habit) => patch((s) => ({ ...s, habits: [...s.habits, { ...habit, id: uid(), completions: [] }] })),
      toggleHabitDay: (id, day) =>
        patch((s) => ({
          ...s,
          habits: s.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  completions: h.completions.includes(day)
                    ? h.completions.filter((c) => c !== day)
                    : [...h.completions, day],
                }
              : h,
          ),
        })),
      deleteHabit: (id) => patch((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) })),
      addGoal: (goal) =>
        patch((s) => ({
          ...s,
          goals: [
            ...s.goals,
            recalcGoal({ ...goal, id: uid(), progress: 0, status: "on-track" }),
          ],
        })),
      updateGoal: (id, p) =>
        patch((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? recalcGoal({ ...g, ...p }) : g)) })),
      toggleMilestone: (goalId, milestoneId) =>
        patch((s) => ({
          ...s,
          goals: s.goals.map((g) =>
            g.id === goalId
              ? recalcGoal({
                  ...g,
                  milestones: g.milestones.map((m) =>
                    m.id === milestoneId ? { ...m, done: !m.done } : m,
                  ),
                })
              : g,
          ),
        })),
      deleteGoal: (id) => patch((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) })),
      addNote: (note) => {
        const id = uid();
        patch((s) => ({
          ...s,
          notes: [{ ...note, id, updatedAt: new Date().toISOString() }, ...s.notes],
        }));
        return id;
      },
      updateNote: (id, p) =>
        patch((s) => ({
          ...s,
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...p, updatedAt: new Date().toISOString() } : n)),
        })),
      deleteNote: (id) => patch((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) })),
      addEvent: (event) => patch((s) => ({ ...s, events: [...s.events, { ...event, id: uid() }] })),
      updateEvent: (id, p) =>
        patch((s) => ({ ...s, events: s.events.map((e) => (e.id === id ? { ...e, ...p } : e)) })),
      deleteEvent: (id) => patch((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) })),
      markNotificationsRead: () =>
        patch((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      pushNotification: (n) =>
        patch((s) => ({
          ...s,
          notifications: [{ ...n, id: uid(), read: false, time: "now" }, ...s.notifications],
        })),
      resetDemo: () => setState(createDemoState()),
    };
  }, [state, hydrated, patch]);

  return <LifeOSContext.Provider value={value}>{children}</LifeOSContext.Provider>;
}

export function useLifeOS() {
  const ctx = useContext(LifeOSContext);
  if (!ctx) throw new Error("useLifeOS must be used inside LifeOSProvider");
  return ctx;
}
