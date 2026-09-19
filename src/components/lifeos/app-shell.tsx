import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  CheckSquare,
  Flame,
  LayoutGrid,
  Leaf,
  LogOut,
  Menu,
  NotebookPen,
  Search,
  Settings,
  Sparkles,
  Target,
  Wand2,
  CalendarRange,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { GlobalSearch } from "@/components/lifeos/global-search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLifeOS } from "@/lib/lifeos/store";
import { cn } from "@/lib/utils";

const primaryNav = [
  { to: "/", label: "Overview", icon: LayoutGrid },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/habits", label: "Habits", icon: Flame },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
] as const;

const aiNav = [
  { to: "/ai-planner", label: "AI Planner", icon: Wand2 },
  { to: "/ai-priorities", label: "AI Priorities", icon: Sparkles },
  { to: "/weekly-plan", label: "Weekly Plan", icon: CalendarRange },
] as const;

const mobileNav = [
  { to: "/", label: "Home", icon: LayoutGrid },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/ai-planner", label: "Plan", icon: Wand2 },
  { to: "/habits", label: "Habits", icon: Flame },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
] as const;

function NavItem({
  to,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: typeof LayoutGrid;
  active: boolean;
  onNavigate?: (() => void) | undefined;
}) {
  return (
    <Link
      to={to as never}
      onClick={onNavigate}
      className={cn(
        "ring-focus group flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] transition-all duration-200",
        active
          ? "bg-[var(--olive)] font-medium text-[var(--warm-white)] shadow-[inset_0_1px_0_oklch(1_0_0/0.08)]"
          : "text-[color-mix(in_oklch,var(--sand)_78%,transparent)] hover:bg-[oklch(0.38_0.026_123)] hover:text-[var(--warm-white)]",
      )}
    >
      <Icon
        className={cn(
          "size-[18px] transition-transform duration-200",
          !active && "group-hover:scale-105",
        )}
      />
      {label}
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { state } = useLifeOS();

  return (
    <div className="flex h-full flex-col bg-[var(--sidebar)] px-4 py-6">
      <div className="flex items-center gap-2.5 px-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--olive)]">
          <Leaf className="size-4 text-[var(--warm-white)]" />
        </span>
        <span className="text-[17px] font-semibold tracking-tight text-[var(--warm-white)]">
          LifeOS
        </span>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {primaryNav.map((item) => (
          <NavItem key={item.to} {...item} active={pathname === item.to} onNavigate={onNavigate} />
        ))}

        <div className="my-4 border-t border-[oklch(1_0_0/0.09)]" />
        <p className="px-3 pb-2 text-[11px] tracking-[0.12em] text-[color-mix(in_oklch,var(--sage)_85%,transparent)] uppercase">
          Intelligence
        </p>
        {aiNav.map((item) => (
          <NavItem key={item.to} {...item} active={pathname === item.to} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="mt-6 flex flex-col gap-1 border-t border-[oklch(1_0_0/0.09)] pt-4">
        <NavItem
          to="/settings"
          label="Settings"
          icon={Settings}
          active={pathname === "/settings"}
          onNavigate={onNavigate}
        />
        <div className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2">
          <span className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-[var(--sage)] text-[12px] font-semibold text-[var(--olive-deep)]">
            {state.user.avatar ? (
              <img src={state.user.avatar} alt="" className="size-full object-cover" />
            ) : (
              state.user.initials
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-[var(--warm-white)]">
              {state.user.name}
            </p>
            <p className="truncate text-[11px] text-[color-mix(in_oklch,var(--sand)_65%,transparent)]">
              {state.user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Notifications() {
  const { state, markNotificationsRead } = useLifeOS();
  const unread = state.notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu onOpenChange={(o) => o && unread > 0 && markNotificationsRead()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" />
          {unread > 0 ? (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[var(--olive)]" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2">
        <DropdownMenuLabel className="px-3 text-[13px]">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {state.notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-[13px] text-muted-foreground">
            You're all caught up.
          </p>
        ) : (
          state.notifications.slice(0, 6).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex-col items-start gap-0.5 rounded-xl px-3 py-2.5"
            >
              <span className="text-[13px] font-medium">{n.title}</span>
              <span className="text-[12px] text-muted-foreground">{n.body}</span>
              <span className="text-[11px] text-[var(--sage)]">{n.time}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProfileMenu() {
  const { state } = useLifeOS();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Profile"
          className="ring-focus ml-1 flex size-9 items-center justify-center overflow-hidden rounded-full bg-[var(--sand)] text-[12px] font-semibold text-[var(--olive-deep)] transition-transform hover:scale-105"
        >
          {state.user.avatar ? (
            <img src={state.user.avatar} alt="" className="size-full object-cover" />
          ) : (
            state.user.initials
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2">
        <DropdownMenuLabel className="px-3 py-2">
          <p className="text-[13.5px] font-medium">{state.user.name}</p>
          <p className="text-[12px] font-normal text-muted-foreground">{state.user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="rounded-xl px-3 py-2" asChild>
          <Link to={"/settings" as never}>Profile & settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-xl px-3 py-2"
          onSelect={() => void navigate({ to: "/auth" as never })}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (pathname.startsWith("/auth")) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-[color-mix(in_oklch,var(--ivory)_86%,transparent)] px-4 backdrop-blur-md sm:px-6 lg:px-10">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[264px] border-none p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </SheetContent>
          </Sheet>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="ring-focus group flex h-9 flex-1 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-left text-[13px] text-muted-foreground transition-colors hover:border-[var(--sage)] sm:max-w-sm"
          >
            <Search className="size-4" />
            <span className="truncate">Search everything…</span>
            <kbd className="ml-auto hidden rounded border border-border px-1.5 py-0.5 text-[10px] sm:inline">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1">
            <Notifications />
            <ProfileMenu />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pb-14">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-[color-mix(in_oklch,var(--warm-white)_94%,transparent)] backdrop-blur-md lg:hidden">
        <div className="flex items-stretch justify-around px-2 py-1.5">
          {mobileNav.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to as never}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] transition-colors",
                  active ? "text-[var(--olive)]" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("size-[18px]", active && "scale-110 transition-transform")} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
