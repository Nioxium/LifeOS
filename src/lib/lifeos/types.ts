export type Priority = "high" | "medium" | "low";

export type TaskCategory = "Work" | "Design" | "Personal" | "Health" | "Learning";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  priority: Priority;
  /** ISO date yyyy-MM-dd */
  dueDate?: string;
  /** HH:mm */
  dueTime?: string;
  category: TaskCategory;
  tags: string[];
  /** minutes */
  estimate?: number;
  goalId?: string;
  order: number;
  createdAt: string;
}

export type HabitFrequency = "daily" | "weekdays" | "3x-week";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  frequency: HabitFrequency;
  preferredTime: "Morning" | "Afternoon" | "Evening" | "Anytime";
  goalPerWeek: number;
  reminder: boolean;
  startDate: string;
  /** ISO dates the habit was completed */
  completions: string[];
}

export type GoalCategory = "Personal" | "Career" | "Health" | "Learning" | "Finance" | "Other";
export type GoalStatus = "on-track" | "at-risk" | "completed";

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  deadline: string;
  progress: number;
  status: GoalStatus;
  importance: number; // 1-5
  milestones: Milestone[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export type EventKind = "meeting" | "personal" | "habit" | "focus";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  kind: EventKind;
  location?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface LifeOSState {
  user: { name: string; initials: string; email: string; avatar?: string };
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  notes: Note[];
  events: CalendarEvent[];
  notifications: AppNotification[];
}
