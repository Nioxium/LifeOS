import { Sparkles } from "lucide-react";
import { useMemo } from "react";

import { ScoreMeter } from "@/components/lifeos/ai-cards";
import { EmptyState, Panel, PanelHeader, SectionTitle } from "@/components/lifeos/primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { rankTasks } from "@/lib/lifeos/ai";
import { useLifeOS } from "@/lib/lifeos/store";
import { cn } from "@/lib/utils";

const levelTone = {
  High: "bg-[var(--olive-deep)] text-[var(--warm-white)]",
  Medium: "bg-[var(--sage)] text-[var(--olive-deep)]",
  Low: "bg-[var(--sand)] text-[var(--olive-deep)]",
} as const;

export default function AIPrioritiesPage() {
  const { state } = useLifeOS();
  const ranked = useMemo(() => rankTasks(state), [state]);

  return (
    <div className="space-y-6">
      <header className="pt-2">
        <SectionTitle>AI Priorities</SectionTitle>
        <p className="mt-1.5 max-w-2xl text-[14.5px] text-muted-foreground">
          Every open task, scored and explained. Nothing is hidden — open a task to see the factors
          behind its rank.
        </p>
      </header>

      <Panel>
        <PanelHeader
          title="Ranked right now"
          description="Deadline 32% · Goal relevance 22% · Your priority 24% · Context 12% · Effort fit 10%"
        />
        <div className="px-4 pb-4">
          {ranked.length === 0 ? (
            <EmptyState
              title="Nothing to rank"
              description="Add a task and LifeOS will weigh it for you."
            />
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {ranked.map((item, i) => (
                <AccordionItem key={item.task.id} value={item.task.id} className="border-border">
                  <AccordionTrigger className="px-2 hover:no-underline">
                    <div className="flex w-full items-center gap-3 pr-3 text-left">
                      <span className="w-5 shrink-0 text-[12px] tabular-nums text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium">
                        {item.task.title}
                      </span>
                      <span
                        className={cn(
                          "hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline",
                          levelTone[item.level],
                        )}
                      >
                        AI Priority: {item.level}
                      </span>
                      <ScoreMeter score={item.score} />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-4">
                    <p className="mb-4 inline-flex items-start gap-2 rounded-lg bg-[color-mix(in_oklch,var(--sage)_12%,transparent)] px-3 py-2 text-[13px] text-muted-foreground">
                      <Sparkles className="mt-0.5 size-3.5 shrink-0 text-[var(--olive)]" />
                      {item.reason}
                    </p>
                    <ul className="space-y-2.5">
                      {item.factors.map((f) => (
                        <li key={f.label} className="flex items-center gap-3">
                          <span className="w-40 shrink-0 text-[12.5px] text-foreground">
                            {f.label}
                          </span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--ivory)]">
                            <div
                              className="h-full rounded-full bg-[var(--sage)] transition-[width] duration-700"
                              style={{ width: `${f.value}%` }}
                            />
                          </div>
                          <span className="w-56 shrink-0 text-right text-[12px] text-muted-foreground">
                            {f.detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </Panel>

      <p className="text-[12px] leading-relaxed text-muted-foreground">
        Scores come from a transparent local scoring model, not a hosted AI service. The service
        layer is isolated so a real model can be connected later without changing this page.
      </p>
    </div>
  );
}
