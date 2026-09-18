import { createFileRoute } from "@tanstack/react-router";
import { addDays, format, startOfWeek } from "date-fns";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";

import { AIInsightCard } from "@/components/lifeos/ai-cards";
import { Panel, PanelHeader, SectionTitle, StatTile } from "@/components/lifeos/primitives";
import { buildWeeklyReview, rankTasks } from "@/lib/lifeos/ai";
import { useLifeOS } from "@/lib/lifeos/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/weekly-plan")({
  head: () => ({
    meta: [
      { title: "Weekly Plan — LifeOS" },
      {
        name: "description",
        content: "A balanced week: your highest-leverage work spread across the days, with review insights to guide it.",
      },
      { property: "og:title", content: "Weekly Plan — LifeOS" },
      { property: "og:description", content: "Spread your priorities across a balanced week." },
    ],
  }),
  component: WeeklyPlanPage,
});

function WeeklyPlanPage() {
  const { state } = useLifeOS();
  const ranked = useMemo(() => rankTasks(state), [state]);
  const review = buildWeeklyReview(state);

  const weekStart = startOfWeek(addDays(new Date(), 7), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Spread the ranked work across the week, heaviest first, lighter on Monday.
  const buckets: Record<number, typeof ranked> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  ranked.forEach((item, i) => {
    const dayIndex = [1, 2, 0, 3, 4, 1, 2, 3][i % 8] ?? 0;
    buckets[dayIndex]?.push(item);
  });

  return (
    <div className="space-y-6">
      <header className="pt-2">
        <SectionTitle>Weekly plan</SectionTitle>
        <p className="mt-1.5 max-w-2xl text-[14.5px] text-muted-foreground">
          Week of {format(weekStart, "d MMM")} — shaped around your priorities, with Monday deliberately lighter.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Tasks completed" value={review.completed} hint="Last 7 days" />
        <StatTile label="Postponed" value={review.postponed} />
        <StatTile label="Habit consistency" value={`${review.habitConsistency}%`} />
        <StatTile label="Goals progressed" value={review.goalsProgressed} />
        <StatTile label="Focus time" value={`${review.focusHours}h`} />
      </div>

      <Panel>
        <PanelHeader title="Next week at a glance" description="Drag-free draft — accept it in the AI Planner." />
        <div className="grid gap-px overflow-hidden bg-border px-0 pb-0 sm:grid-cols-7">
          {days.map((day, i) => (
            <div key={day.toISOString()} className="min-h-[180px] bg-card p-3">
              <p className="mb-2 text-[12px] font-medium text-muted-foreground">{format(day, "EEE d")}</p>
              <div className="space-y-1.5">
                {(buckets[i] ?? []).slice(0, 4).map((item) => (
                  <div
                    key={item.task.id}
                    className={cn(
                      "rounded-lg px-2 py-1.5 text-[11.5px] leading-snug",
                      item.level === "High"
                        ? "bg-[var(--olive)] text-[var(--warm-white)]"
                        : item.level === "Medium"
                          ? "bg-[color-mix(in_oklch,var(--sage)_35%,var(--warm-white))] text-foreground"
                          : "bg-[color-mix(in_oklch,var(--sand)_45%,var(--warm-white))] text-foreground",
                    )}
                  >
                    {item.task.title}
                  </div>
                ))}
                {(buckets[i] ?? []).length === 0 ? (
                  <p className="text-[11.5px] text-muted-foreground">Open space</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Insights from last week" />
        <div className="grid gap-3 px-6 pb-6 lg:grid-cols-2">
          {review.insights.map((insight, i) => (
            <AIInsightCard
              key={insight}
              title={["Completion", "Consistency", "Load", "Leverage"][i] ?? "Insight"}
              body={insight}
              tone={i % 2 === 0 ? "sage" : "sand"}
            />
          ))}
        </div>
        <p className="flex items-center gap-1.5 px-6 pb-6 text-[13px] text-[var(--olive)]">
          Plan next week <ArrowRight className="size-3.5" />
        </p>
      </Panel>
    </div>
  );
}
