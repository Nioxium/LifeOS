import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Flame,
  Leaf,
  NotebookPen,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const previewUrl = "https://id-preview--9542639c-b121-44ca-9c8b-4342080a0c52.lovable.app/hero-landing.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LifeOS — Your calm home for tasks, habits and goals" },
      {
        name: "description",
        content:
          "LifeOS brings tasks, habits, goals, notes and calendar into one calm workspace, with an AI priority system that shows what deserves your attention today.",
      },
      {
        property: "og:title",
        content: "LifeOS — Everything in your life, organized in one calm space",
      },
      {
        property: "og:description",
        content: "A personal operating system for tasks, habits, goals, notes and your calendar.",
      },
      { property: "og:image", content: previewUrl },
      { name: "twitter:image", content: previewUrl },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: CheckCircle2,
    title: "Tasks",
    description: "Capture everything, then focus on what matters today.",
    tone: "olive",
  },
  {
    icon: Flame,
    title: "Habits",
    description: "Build streaks, track consistency, make routines stick.",
    tone: "sage",
  },
  {
    icon: Target,
    title: "Goals",
    description: "Turn ambitions into milestones you can actually reach.",
    tone: "sand",
  },
  {
    icon: NotebookPen,
    title: "Notes",
    description: "A calm place to think, plan and reference later.",
    tone: "olive",
  },
  {
    icon: CalendarDays,
    title: "Calendar",
    description: "Meetings, focus blocks and deadlines in one timeline.",
    tone: "sage",
  },
  {
    icon: Sparkles,
    title: "AI Priorities",
    description: "See why one task comes before another — not just a ranking.",
    tone: "sand",
  },
] as const;

const highlights = [
  "AI-ranked daily focus based on deadlines, goals and effort",
  "Habit streaks and weekly consistency, at a glance",
  "Goals broken into milestones with clear progress",
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--ivory)] text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[color-mix(in_oklch,var(--ivory)_92%,transparent)] px-5 backdrop-blur-md sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--olive)]">
            <Leaf className="size-4 text-[var(--warm-white)]" />
          </span>
          <span className="text-[17px] font-semibold tracking-tight">LifeOS</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link to="/auth">Get started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pt-16 pb-20 sm:px-8 lg:px-12 lg:pt-24 lg:pb-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-[color-mix(in_oklch,var(--sage)_18%,transparent)] to-transparent" />
        <div className="pointer-events-none absolute right-[-160px] top-[-80px] size-[420px] rounded-full bg-[color-mix(in_oklch,var(--sage)_22%,transparent)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-120px] left-[-120px] size-[360px] rounded-full bg-[color-mix(in_oklch,var(--sand)_24%,transparent)] blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div className="max-w-xl">
            <p className="text-[12px] tracking-[0.16em] text-[var(--olive)] uppercase">
              Your personal operating system
            </p>
            <h1 className="mt-4 text-[38px] leading-[1.08] font-semibold tracking-tight text-[var(--olive-deep)] sm:text-[46px] lg:text-[54px]">
              Start the day knowing exactly what deserves your attention.
            </h1>
            <p className="mt-5 text-[16.5px] leading-relaxed text-muted-foreground sm:text-[18px]">
              LifeOS brings tasks, habits, goals, notes and calendar into one calm workspace.
              Our AI planner ranks your priorities and explains why one thing comes first.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 gap-2 rounded-full px-7 text-[15px]">
                <Link to="/auth">
                  Get started free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-6 text-[15px]"
              >
                <Link to="/auth">See how it works</Link>
              </Button>
            </div>
            <ul className="mt-8 space-y-2.5">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-2.5 text-[14px] text-muted-foreground">
                  <CheckCircle2 className="size-[18px] text-[var(--olive)]" />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-[var(--border)] shadow-[0_24px_80px_-24px_oklch(0.35_0.03_123/0.22)]">
              <img
                src="/hero-landing.jpg"
                alt="A calm, organized workspace with morning light"
                width={1200}
                height={800}
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
            {/* Floating priority card */}
            <div className="absolute -bottom-6 -left-6 max-w-[240px] rounded-2xl border border-[var(--border)] bg-[var(--warm-white)] p-4 shadow-lg sm:-left-10 sm:max-w-[280px]">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-[var(--olive)]">
                  <Sparkles className="size-3.5 text-[var(--warm-white)]" />
                </span>
                <span className="text-[12px] font-medium tracking-wide text-[var(--olive)] uppercase">
                  AI Priority
                </span>
              </div>
              <p className="mt-2 text-[14px] font-medium text-foreground">
                Finish portfolio case study
              </p>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Deadline today + linked to Launch Portfolio goal
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-[12px] tracking-[0.16em] text-[var(--olive)] uppercase">Features</p>
            <h2 className="mt-3 text-[30px] font-semibold tracking-tight text-[var(--olive-deep)] sm:text-[36px]">
              Everything you need to stay on top of life.
            </h2>
            <p className="mt-3 text-[16px] text-muted-foreground">
              No juggling apps. One calm workspace for what matters most.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--warm-white)] p-6 shadow-[0_2px_16px_-6px_oklch(0.35_0.03_123/0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_-10px_oklch(0.35_0.03_123/0.14)]"
              >
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl",
                    f.tone === "olive"
                      ? "bg-[var(--olive)] text-[var(--warm-white)]"
                      : f.tone === "sage"
                        ? "bg-[color-mix(in_oklch,var(--sage)_35%,var(--warm-white))] text-[var(--olive)]"
                        : "bg-[var(--sand)] text-[var(--olive-deep)]",
                  )}
                >
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-[17px] font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI planner spotlight */}
      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="order-2 rounded-[2rem] border border-[var(--border)] bg-[var(--warm-white)] p-7 shadow-[0_24px_80px_-24px_oklch(0.35_0.03_123/0.18)] lg:order-1">
            <div className="space-y-4">
              <div className="rounded-xl bg-[color-mix(in_oklch,var(--olive)_10%,var(--warm-white))] p-4">
                <div className="flex items-center gap-2 text-[12px] font-medium tracking-wide text-[var(--olive)] uppercase">
                  <Wand2 className="size-3.5" /> Morning
                </div>
                <p className="mt-2 text-[14px] font-medium">Deep work: Finish portfolio case study</p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  Why first: due today and tied to your top goal.
                </p>
              </div>
              <div className="rounded-xl bg-[color-mix(in_oklch,var(--sage)_18%,var(--warm-white))] p-4">
                <div className="flex items-center gap-2 text-[12px] font-medium tracking-wide text-[var(--olive)] uppercase">
                  <Wand2 className="size-3.5" /> Afternoon
                </div>
                <p className="mt-2 text-[14px] font-medium">Admin block: Review project proposal</p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  Scheduled after meetings when energy is lower.
                </p>
              </div>
              <div className="rounded-xl bg-[color-mix(in_oklch,var(--sand)_35%,var(--warm-white))] p-4">
                <div className="flex items-center gap-2 text-[12px] font-medium tracking-wide text-[var(--olive)] uppercase">
                  <Wand2 className="size-3.5" /> Evening
                </div>
                <p className="mt-2 text-[14px] font-medium">Habit routine + personal tasks</p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">
                  Wind down with workouts, reading and journaling.
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 max-w-xl lg:order-2">
            <p className="text-[12px] tracking-[0.16em] text-[var(--olive)] uppercase">AI Planner</p>
            <h2 className="mt-3 text-[30px] font-semibold tracking-tight text-[var(--olive-deep)] sm:text-[36px]">
              A plan that explains itself.
            </h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-muted-foreground">
              LifeOS doesn't just sort your tasks. It builds a daily plan around your calendar,
              habits and goals — and tells you why each block belongs where it does.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Morning deep work", "Afternoon admin", "Evening habits", "Weekly review"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border)] bg-[var(--warm-white)] px-3.5 py-1.5 text-[13px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[var(--olive)]">
            <Leaf className="size-6 text-[var(--warm-white)]" />
          </div>
          <blockquote className="mt-6 text-[22px] leading-snug font-medium text-[var(--olive-deep)] sm:text-[28px]">
            “LifeOS finally made my priorities feel calm instead of chaotic. I open it and I know
            exactly where to start.”
          </blockquote>
          <p className="mt-5 text-[14px] text-muted-foreground">Alex Morgan, product designer</p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-[var(--olive-deep)] px-8 py-16 text-center sm:px-12 lg:py-24">
          <h2 className="text-[30px] font-semibold tracking-tight text-[var(--warm-white)] sm:text-[40px]">
            Ready for a calmer way to work?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[color-mix(in_oklch,var(--sand)_85%,transparent)]">
            Join LifeOS and start each day with a clear, intelligent plan.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 gap-2 rounded-full border-0 bg-[var(--warm-white)] px-8 text-[15px] text-[var(--olive-deep)] hover:bg-[var(--sand)]"
          >
            <Link to="/auth">
              Get started free <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--olive)]">
              <Leaf className="size-3.5 text-[var(--warm-white)]" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">LifeOS</span>
          </div>
          <p className="text-[13px] text-muted-foreground">
            © {new Date().getFullYear()} LifeOS. Built for calm, intelligent days.
          </p>
        </div>
      </footer>
    </div>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
