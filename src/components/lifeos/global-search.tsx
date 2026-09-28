import { useNavigate } from "react-router-dom";
import { CalendarDays, CheckSquare, Flame, NotebookPen, Target } from "lucide-react";
import { useEffect, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useLifeOS } from "@/lib/lifeos/store";

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { state } = useLifeOS();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search tasks, habits, goals, notes and events…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="scrollbar-slim">
        <CommandEmpty>Nothing matched that search.</CommandEmpty>
        <CommandGroup heading="Tasks">
          {state.tasks.slice(0, 20).map((t) => (
            <CommandItem
              key={t.id}
              value={`task ${t.title} ${t.tags.join(" ")}`}
              onSelect={() => go("/tasks")}
            >
              <CheckSquare className="size-4 text-[var(--olive)]" />
              <span>{t.title}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">{t.category}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Goals">
          {state.goals.map((g) => (
            <CommandItem
              key={g.id}
              value={`goal ${g.title} ${g.description}`}
              onSelect={() => go("/goals")}
            >
              <Target className="size-4 text-[var(--olive)]" />
              <span>{g.title}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">{g.progress}%</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Habits">
          {state.habits.map((h) => (
            <CommandItem key={h.id} value={`habit ${h.name}`} onSelect={() => go("/habits")}>
              <Flame className="size-4 text-[var(--sage)]" />
              <span>{h.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Notes">
          {state.notes.map((n) => (
            <CommandItem
              key={n.id}
              value={`note ${n.title} ${n.content}`}
              onSelect={() => go("/notes")}
            >
              <NotebookPen className="size-4 text-[var(--olive)]" />
              <span>{n.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Calendar">
          {state.events.map((e) => (
            <CommandItem
              key={e.id}
              value={`event ${e.title} ${e.date}`}
              onSelect={() => go("/calendar")}
            >
              <CalendarDays className="size-4 text-[var(--sage)]" />
              <span>{e.title}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">
                {e.date} · {e.start}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
