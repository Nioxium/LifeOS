import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Leaf, Loader2, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLifeOS } from "@/lib/lifeos/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — LifeOS" },
      {
        name: "description",
        content:
          "Sign in to LifeOS to pick up your tasks, habits, goals and daily AI plan where you left off.",
      },
      { property: "og:title", content: "Sign in — LifeOS" },
      { property: "og:description", content: "Your calm, intelligent personal operating system." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

const highlights = [
  "A daily plan built around what actually matters",
  "Habits, goals and calendar in one calm place",
  "Priorities explained, never just ranked",
];

function AuthPage() {
  const navigate = useNavigate();
  const { updateUser } = useLifeOS();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const finish = (label: string) => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      if (mode === "forgot") {
        setSent(true);
        return;
      }
      if (mode === "signup" && name.trim()) {
        const initials = name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((p) => p[0]?.toUpperCase() ?? "")
          .join("");
        updateUser({ name: name.trim(), initials: initials || "AM", email: email.trim() });
      } else if (email.trim()) {
        updateUser({ email: email.trim() });
      }
      toast.success(label);
      void navigate({ to: "/" as never });
    }, 700);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === "forgot") return finish("");
    finish(mode === "signup" ? "Welcome to LifeOS 🌿" : "Welcome back");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Editorial panel */}
      <aside className="relative hidden flex-col justify-between bg-[var(--olive-deep)] p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--olive)]">
            <Leaf className="size-4 text-[var(--warm-white)]" />
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-[var(--warm-white)]">
            LifeOS
          </span>
        </div>

        <div className="max-w-md">
          <p className="text-[12px] tracking-[0.16em] text-[var(--sage)] uppercase">
            Your personal operating system
          </p>
          <h1 className="mt-4 text-[40px] leading-[1.1] font-semibold text-[var(--warm-white)]">
            Start the day knowing exactly what deserves your attention.
          </h1>
          <ul className="mt-8 space-y-3">
            {highlights.map((h) => (
              <li
                key={h}
                className="flex items-start gap-3 text-[14.5px] text-[color-mix(in_oklch,var(--sand)_88%,transparent)]"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--olive)]">
                  <Check className="size-3 text-[var(--warm-white)]" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[12.5px] text-[color-mix(in_oklch,var(--sand)_55%,transparent)]">
          “Calm, intelligent, personal.”
        </p>
        <div className="pointer-events-none absolute right-[-120px] bottom-[-120px] size-[360px] rounded-full bg-[color-mix(in_oklch,var(--sage)_22%,transparent)] blur-3xl" />
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center bg-background px-5 py-12 sm:px-10">
        <div className="animate-leaf-in w-full max-w-[380px]">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--olive)]">
              <Leaf className="size-4 text-[var(--warm-white)]" />
            </span>
            <span className="text-[17px] font-semibold tracking-tight">LifeOS</span>
          </div>

          {mode === "forgot" && sent ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--sage)_30%,var(--warm-white))]">
                <Mail className="size-4 text-[var(--olive)]" />
              </span>
              <h2 className="mt-4 text-[18px] font-semibold">Check your inbox</h2>
              <p className="mt-2 text-[13.5px] text-muted-foreground">
                If an account exists for {email || "that address"}, a reset link is on its way.
              </p>
              <Button
                variant="outline"
                className="mt-5 w-full rounded-full"
                onClick={() => {
                  setSent(false);
                  setMode("signin");
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-[26px] font-semibold tracking-tight">
                {mode === "signin"
                  ? "Welcome back"
                  : mode === "signup"
                    ? "Create your LifeOS"
                    : "Reset your password"}
              </h2>
              <p className="mt-1.5 text-[14px] text-muted-foreground">
                {mode === "signin"
                  ? "Pick up right where you left off."
                  : mode === "signup"
                    ? "A few seconds now, a calmer week ahead."
                    : "We'll email you a link to set a new one."}
              </p>

              {mode !== "forgot" ? (
                <>
                  <Button
                    variant="outline"
                    className="mt-7 h-11 w-full gap-2.5 rounded-full text-[14px]"
                    onClick={() => {
                      toast.info("Google sign-in becomes live once accounts are connected.");
                    }}
                  >
                    <GoogleMark />
                    Continue with Google
                  </Button>
                  <div className="my-6 flex items-center gap-3">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-[11.5px] tracking-wide text-muted-foreground uppercase">
                      or
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                </>
              ) : (
                <div className="h-7" />
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                {mode === "signup" ? (
                  <div className="grid gap-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="h-11 rounded-xl"
                      required
                    />
                  </div>
                ) : null}

                <div className="grid gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                {mode !== "forgot" ? (
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {mode === "signin" ? (
                        <button
                          type="button"
                          onClick={() => setMode("forgot")}
                          className="text-[12.5px] text-[var(--olive)] hover:underline"
                        >
                          Forgot?
                        </button>
                      ) : null}
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 rounded-xl"
                      minLength={6}
                      required
                    />
                  </div>
                ) : null}

                <Button
                  type="submit"
                  disabled={busy}
                  className="h-11 w-full gap-2 rounded-full text-[14px]"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  {mode === "signin"
                    ? "Sign in"
                    : mode === "signup"
                      ? "Create account"
                      : "Send reset link"}
                  {!busy ? <ArrowRight className="size-4" /> : null}
                </Button>
              </form>

              <p className="mt-6 text-center text-[13.5px] text-muted-foreground">
                {mode === "signup" ? "Already have an account?" : "New to LifeOS?"}{" "}
                <button
                  type="button"
                  className="font-medium text-[var(--olive)] hover:underline"
                  onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                >
                  {mode === "signup" ? "Sign in" : "Create one"}
                </button>
              </p>

              <p
                className={cn(
                  "mt-8 rounded-xl border border-border bg-card px-4 py-3 text-[12px] leading-relaxed text-muted-foreground",
                )}
              >
                These sign-in screens are the front end only — LifeOS still runs on demo data in
                this browser. Connect a backend to make accounts real.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
      />
    </svg>
  );
}
