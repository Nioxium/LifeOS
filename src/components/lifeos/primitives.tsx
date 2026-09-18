import { Leaf } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/lifeos/types";

export function Panel({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card",
        hover && "surface-hover",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  action,
  description,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
      <div>
        <h2 className="text-[17px] font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

const priorityStyles: Record<Priority, string> = {
  high: "bg-[var(--olive-deep)] text-[var(--warm-white)]",
  medium: "bg-[var(--sage)] text-[var(--olive-deep)]",
  low: "bg-[var(--sand)] text-[var(--olive-deep)]",
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize tracking-wide",
        priorityStyles[priority],
        className,
      )}
    >
      {priority}
    </span>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-[var(--ivory)] px-2 py-0.5 text-[11px] text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  tone = "olive",
  className,
}: {
  value: number;
  tone?: "olive" | "sage" | "sand";
  className?: string;
}) {
  const color = tone === "olive" ? "var(--olive)" : tone === "sage" ? "var(--sage)" : "var(--sand)";
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-[var(--ivory)]", className)}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <span className="mb-1 flex size-10 items-center justify-center rounded-full bg-[var(--ivory)] text-[var(--sage)]">
        <Leaf className="size-5" />
      </span>
      <p className="text-[15px] font-medium text-foreground">{title}</p>
      <p className="max-w-xs text-[13px] text-muted-foreground">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-[22px] font-semibold tracking-tight text-foreground sm:text-[26px]">
      {children}
    </h1>
  );
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4">
      <p className="text-[12px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1.5 text-[24px] leading-none font-semibold text-foreground">{value}</p>
      {hint ? <p className="mt-1.5 text-[12px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
