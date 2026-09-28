import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/lifeos/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { LifeOSProvider } from "@/lib/lifeos/store";
import AIPPlannerPage from "@/routes/ai-planner";
import AIPrioritiesPage from "@/routes/ai-priorities";
import AuthPage from "@/routes/auth";
import CalendarPage from "@/routes/calendar";
import Dashboard from "@/routes/dashboard";
import GoalsPage from "@/routes/goals";
import HabitsPage from "@/routes/habits";
import LandingPage from "@/routes/index";
import NotesPage from "@/routes/notes";
import SettingsPage from "@/routes/settings";
import TasksPage from "@/routes/tasks";
import WeeklyPlanPage from "@/routes/weekly-plan";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LifeOSProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/ai-planner" element={<AIPPlannerPage />} />
            <Route path="/ai-priorities" element={<AIPrioritiesPage />} />
            <Route path="/weekly-plan" element={<WeeklyPlanPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LifeOSProvider>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
