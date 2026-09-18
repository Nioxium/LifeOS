import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowRight, Check, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AIInsightCard } from "@/components/lifeos/ai-cards";
import { Panel, PanelHeader, SectionTitle, StatTile } from "@/components/lifeos/primitives";
import { Button } from "@/components/ui/button";
import { buildWeeklyReview, getDayPlan, type DayPlan, type PlanBlock } from "@/lib/lifeos/ai";
import { useLifeOS } from "@/lib/lifeos/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ai-planner")({
  head: () => ({
    meta: [
      { title: "AI Planner — LifeOS" },
      {
        name: "description",
        content:
          "Let LifeOS organize your day around what matters most, with a morning, afternoon and evening plan you can accept or regenerate.",
      },
      { property: "og:title", content: "AI Planner — LifeOS" },
      { property: "og:description", content: "A calm, explained plan for your day." },
    ],
  }),
  component: AIPlannerPage,
});

const kindTone: Record<PlanBlock["kind"], string> = {
  focus: "bg-[var(--olive-deep)]",
  task: "bg-[var(--olive)]",
  meeting: "bg-[var(--sage)]",
  habit: "bg-[var(--sand)]",
  break: "bg-[var(--sand)]",
};

function AIPlannerPage() {
  const { state, pushNotification } = useLifeOS();
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [seed, setSeed] = useState(0);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void getDayPlan(state, seed).then((p) => {
      if (!cancelled) {
        setPlan(p);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const review = buildWeeklyReview(state);
  const periods: PlanBlock["period"][] = ["Morning", "Afternoon", "Evening"];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div>
          <SectionTitle>AI Planner ✨</SectionTitle>
          <p className="mt-1.5 max-w-xl text-[14.5px] text-muted-foreground">
            Let LifeOS organize your day around what matters most.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              setAccepted(false);
              setSeed((s) => s + 1);
            }}
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} /> Regenerate plan
          </Button>
          <Button
            className="rounded-full"
            onClick={() => {
              setAccepted(true);
              pushNotification({ title: "AI plan accepted", body: "Today's plan is now your schedule." });
              toast.success("Plan accepted for today");
            }}
          >
            <Check className="size-4" /> {accepted ? "Plan accepted" : "Accept plan"}
          </Button>
        </div>
      </header>

      <Panel className="px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--olive)]">
            <Sparkles className="size-4" /> Today's AI Plan · {format(new Date(), "EEEE d MMM")}
          </p>
          <p className="text-[12.5px] text-muted-foreground">{plan?.summary}</p>
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="animate-ai-thinking h-12 rounded-xl" />
            ))}
            <p className="pt-1 text-[13px] text-muted-foreground">Weighing deadlines, goals and free time…</p>
          </div>
        ) : (
          <div className="mt-6 space-y-7">
            {periods.map((period) => {
              const blocks = plan?.blocks.filter((b) => b.period === period) ?? [];
              if (!blocks.length) return null;
              return (
                <div key={period} className="animate-leaf-in">
                  <p className="mb-3 text-[12px] tracking-[0.12em] text-[var(--sage)] uppercase">{period}</p>
                  <div className="space-y-2.5">
                    {blocks.map((b) => (
                      <div
                        key={b.id}
                        className="flex gap-3 rounded-xl border border-border bg-[var(--ivory)]/50 px-4 py-3"
                      >
                        <span className={cn("mt-1 h-full min-h-9 w-[3px] shrink-0 rounded-full", kindTone[b.kind])} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-3">
                            <p className="text-[14.5px] font-medium text-foreground">{b.title}</p>
                            <span className="text-[12px] tabular-nums text-muted-foreground">{b.time}</span>
                          </div>
                          <p className="mt-0.5 text-[12.5px] text-muted-foreground">{b.detail}</p>
                          {b.why ? (
                            <p className="mt-2 rounded-lg border border-[color-mix(in_oklch,var(--sage)_45%,var(--border))] bg-[color-mix(in_oklch,var(--sage)_10%,transparent)] px-3 py-2 text-[12.5px] leading-relaxed text-muted-foreground">
                              <span className="font-medium text-foreground">Why this comes first — </span>
                              {b.why}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-6 border-t border-border pt-4 text-[12px] leading-relaxed text-muted-foreground">
          This plan is produced by LifeOS's built-in scheduling heuristics — deadlines, goal weight, your stated
          priority, calendar availability and estimated effort. It runs locally today and is built so a hosted AI model
          can be connected later without changing the experience.
        </p>
      </Panel>

      <Panel>
        <PanelHeader
          title="Weekly review"
          description="Your week at a glance"
          action={
            <Link
              to="/weekly-plan"
              className="ring-focus inline-flex items-center gap-1 text-[13px] text-[var(--olive)] hover:underline"
            >
              Plan next week <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2 lg:grid-cols-5">
          <StatTile label="Completed" value={review.completed} />
          <StatTile label="Postponed" value={review.postponed} />
          <StatTile label="Habits" value={`${review.habitConsistency}%`} />
          <StatTile label="Goals moved" value={review.goalsProgressed} />
          <StatTile label="Focus time" value={`${review.focusHours}h`} />
        </div>
        <div className="grid gap-3 px-6 pb-6 lg:grid-cols-2">
          {review.insights.map((insight, i) => (
            <AIInsightCard
              key={insight}
              title={i === 0 ? "Completion" : i === 1 ? "Consistency" : i === 2 ? "Load" : "Leverage"}
              body={insight}
              tone={i % 2 === 0 ? "sage" : "sand"}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}
