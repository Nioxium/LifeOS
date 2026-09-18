import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

import type { ScoredTask } from "@/lib/lifeos/ai";
import { cn } from "@/lib/utils";

export function AIPriorityHero({ items }: { items: ScoredTask[] }) {
  const top = items.slice(0, 3);

  return (
    <section className="animate-leaf-in relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--sage)_50%,var(--border))] bg-[color-mix(in_oklch,var(--sage)_16%,var(--warm-white))] px-6 py-6 sm:px-7">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-52 rounded-full bg-[color-mix(in_oklch,var(--sand)_45%,transparent)] blur-2xl"
      />
      <div className="relative">
        <p className="inline-flex items-center gap-2 text-[13px] font-medium tracking-wide text-[var(--olive)]">
          <Sparkles className="size-4" /> Your focus for today
        </p>

        {top.length === 0 ? (
          <p className="mt-4 text-[15px] text-muted-foreground">
            Nothing open right now. Your day is clear 🌿
          </p>
        ) : (
          <ol className="mt-4 space-y-3.5">
            {top.map((item, i) => (
              <li key={item.task.id} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_oklch,var(--olive)_40%,transparent)] text-[12px] font-medium text-[var(--olive)]">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[15.5px] leading-snug font-medium text-foreground">
                    {item.task.title}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                    {item.level} impact · {item.factors[0]?.detail}
                    {item.task.estimate ? ` · ${item.task.estimate} min` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            to={"/ai-planner" as never}
            className="ring-focus inline-flex items-center gap-1.5 rounded-full bg-[var(--olive)] px-4 py-2 text-[13px] font-medium text-[var(--warm-white)] transition-all duration-200 hover:bg-[var(--olive-deep)]"
          >
            View AI Plan <ArrowRight className="size-3.5" />
          </Link>
          <p className="max-w-md text-[12px] leading-relaxed text-muted-foreground">
            Prioritized based on deadlines, goals, calendar availability and estimated effort.
          </p>
        </div>
      </div>
    </section>
  );
}

export function AIInsightCard({
  title,
  body,
  tone = "sage",
}: {
  title: string;
  body: string;
  tone?: "sage" | "sand";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3.5",
        tone === "sage"
          ? "border-[color-mix(in_oklch,var(--sage)_45%,var(--border))] bg-[color-mix(in_oklch,var(--sage)_12%,var(--warm-white))]"
          : "border-[color-mix(in_oklch,var(--sand)_60%,var(--border))] bg-[color-mix(in_oklch,var(--sand)_22%,var(--warm-white))]",
      )}
    >
      <p className="text-[13px] font-medium text-foreground">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

export function ScoreMeter({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--ivory)]">
        <div
          className="h-full rounded-full bg-[var(--olive)] transition-[width] duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[12px] tabular-nums text-muted-foreground">{score}</span>
    </div>
  );
}
