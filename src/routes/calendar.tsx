import { createFileRoute } from "@tanstack/react-router";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { EmptyState, Panel, SectionTitle } from "@/components/lifeos/primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLifeOS } from "@/lib/lifeos/store";
import type { CalendarEvent, EventKind } from "@/lib/lifeos/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — LifeOS" },
      {
        name: "description",
        content: "Month, week and day views that combine meetings, habits, personal events and task deadlines.",
      },
      { property: "og:title", content: "Calendar — LifeOS" },
      { property: "og:description", content: "One timeline for meetings, habits and task deadlines." },
    ],
  }),
  component: CalendarPage,
});

const kindTone: Record<EventKind, string> = {
  meeting: "bg-[var(--olive)] text-[var(--warm-white)]",
  focus: "bg-[var(--olive-deep)] text-[var(--warm-white)]",
  habit: "bg-[var(--sage)] text-[var(--olive-deep)]",
  personal: "bg-[var(--sand)] text-[var(--olive-deep)]",
};

type View = "month" | "week" | "day";

function EventDialog({
  open,
  onOpenChange,
  event,
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  event?: CalendarEvent | null;
  defaultDate: string;
}) {
  const { addEvent, updateEvent, deleteEvent } = useLifeOS();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [kind, setKind] = useState<EventKind>("meeting");
  const lastEventId = useRef<string | null>(null);

  if (open && event && lastEventId.current !== event.id) {
    lastEventId.current = event.id;
    setTitle(event.title);
    setDate(event.date);
    setStart(event.start);
    setEnd(event.end);
    setKind(event.kind);
  }
  if (open && !event && lastEventId.current !== "new") {
    lastEventId.current = "new";
    setTitle("");
    setDate(defaultDate);
  }
  if (!open && lastEventId.current !== null) lastEventId.current = null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{event ? "Edit event" : "New event"}</DialogTitle>
          <DialogDescription>Events, habits and deadlines share one timeline.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="ev-title">Title</Label>
            <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="ev-date">Date</Label>
              <Input id="ev-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as EventKind)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="focus">Focus block</SelectItem>
                  <SelectItem value="habit">Habit</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ev-start">Start</Label>
              <Input id="ev-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ev-end">End</Label>
              <Input id="ev-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          {event ? (
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                deleteEvent(event.id);
                onOpenChange(false);
                toast.success("Event removed");
              }}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          ) : (
            <span />
          )}
          <Button
            onClick={() => {
              if (!title.trim()) {
                toast.error("Give the event a title first.");
                return;
              }
              if (event) updateEvent(event.id, { title: title.trim(), date, start, end, kind });
              else addEvent({ title: title.trim(), date, start, end, kind });
              toast.success(event ? "Event updated" : "Event added");
              onOpenChange(false);
            }}
          >
            {event ? "Save" : "Add event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CalendarPage() {
  const { state, updateEvent } = useLifeOS();
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const dragId = useRef<string | null>(null);

  const deadlineEvents = useMemo<CalendarEvent[]>(
    () =>
      state.tasks
        .filter((t) => !!t.dueDate && !t.completed)
        .map((t) => ({
          id: `task-${t.id}`,
          title: t.title,
          date: t.dueDate!,
          start: t.dueTime ?? "09:00",
          end: t.dueTime ?? "09:30",
          kind: "focus" as const,
        })),
    [state.tasks],
  );

  const allEvents = [...state.events, ...deadlineEvents];
  const eventsOn = (day: Date) =>
    allEvents
      .filter((e) => isSameDay(parseISO(e.date), day))
      .sort((a, b) => a.start.localeCompare(b.start));

  const monthDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
  });
  const weekDaysList = eachDayOfInterval({
    start: startOfWeek(cursor, { weekStartsOn: 1 }),
    end: endOfWeek(cursor, { weekStartsOn: 1 }),
  });

  const openNew = (day?: Date) => {
    setEditing(null);
    setCursor(day ?? cursor);
    setDialogOpen(true);
  };

  const onDropDay = (day: Date) => {
    const id = dragId.current;
    if (!id || id.startsWith("task-")) return;
    updateEvent(id, { date: format(day, "yyyy-MM-dd") });
    dragId.current = null;
    toast.success("Event rescheduled");
  };

  const EventChip = ({ event }: { event: CalendarEvent }) => (
    <button
      type="button"
      draggable={!event.id.startsWith("task-")}
      onDragStart={() => (dragId.current = event.id)}
      onClick={(e) => {
        e.stopPropagation();
        if (event.id.startsWith("task-")) return;
        setEditing(event);
        setDialogOpen(true);
      }}
      className={cn(
        "ring-focus block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11px] transition-opacity hover:opacity-85",
        kindTone[event.kind],
      )}
    >
      {event.start} {event.title}
    </button>
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div>
          <SectionTitle>Calendar</SectionTitle>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            Meetings, habits and task deadlines in one place.
          </p>
        </div>
        <Button className="rounded-full" onClick={() => openNew()}>
          <Plus className="size-4" /> New event
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous"
            onClick={() => setCursor(view === "month" ? subMonths(cursor, 1) : addDays(cursor, view === "week" ? -7 : -1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[160px] text-center text-[15px] font-medium">
            {view === "day" ? format(cursor, "EEEE d MMM") : format(cursor, "MMMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next"
            onClick={() => setCursor(view === "month" ? addMonths(cursor, 1) : addDays(cursor, view === "week" ? 7 : 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" className="rounded-full text-[13px]" onClick={() => setCursor(new Date())}>
            Today
          </Button>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as View)} className="ml-auto">
          <TabsList className="rounded-full bg-card p-1">
            {(["month", "week", "day"] as View[]).map((v) => (
              <TabsTrigger key={v} value={v} className="rounded-full px-4 text-[13px] capitalize">
                {v}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Panel className="overflow-hidden">
        {view === "month" ? (
          <div className="grid grid-cols-7">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div
                key={d}
                className="border-b border-border px-2 py-2.5 text-center text-[11px] tracking-wide text-muted-foreground uppercase"
              >
                {d}
              </div>
            ))}
            {monthDays.map((day) => (
              <div
                key={day.toISOString()}
                onClick={() => openNew(day)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropDay(day)}
                className={cn(
                  "min-h-[104px] cursor-pointer space-y-1 border-r border-b border-border p-1.5 transition-colors last:border-r-0 hover:bg-[var(--ivory)]",
                  !isSameMonth(day, cursor) && "bg-[var(--ivory)]/60 opacity-60",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-full text-[12px]",
                    isToday(day)
                      ? "bg-[var(--olive)] font-medium text-[var(--warm-white)]"
                      : "text-muted-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>
                {eventsOn(day)
                  .slice(0, 3)
                  .map((e) => (
                    <EventChip key={e.id} event={e} />
                  ))}
                {eventsOn(day).length > 3 ? (
                  <p className="px-1 text-[10px] text-muted-foreground">+{eventsOn(day).length - 3} more</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : view === "week" ? (
          <div className="grid grid-cols-1 sm:grid-cols-7">
            {weekDaysList.map((day) => (
              <div
                key={day.toISOString()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropDay(day)}
                className="min-h-[220px] space-y-1.5 border-b border-border p-2 sm:border-r sm:last:border-r-0"
              >
                <p
                  className={cn(
                    "mb-1 text-[12px] font-medium",
                    isToday(day) ? "text-[var(--olive)]" : "text-muted-foreground",
                  )}
                >
                  {format(day, "EEE d")}
                </p>
                {eventsOn(day).map((e) => (
                  <EventChip key={e.id} event={e} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {eventsOn(cursor).length === 0 ? (
              <EmptyState title="Nothing scheduled" description="This day is entirely yours." />
            ) : (
              eventsOn(cursor).map((e) => (
                <div key={e.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="w-24 shrink-0 text-[13px] tabular-nums text-muted-foreground">
                    {e.start} – {e.end}
                  </span>
                  <span className={cn("h-8 w-[3px] rounded-full", kindTone[e.kind])} />
                  <button
                    type="button"
                    onClick={() => {
                      if (e.id.startsWith("task-")) return;
                      setEditing(e);
                      setDialogOpen(true);
                    }}
                    className="ring-focus text-left text-[14.5px] font-medium"
                  >
                    {e.title}
                  </button>
                  <span className="ml-auto text-[12px] text-muted-foreground capitalize">{e.kind}</span>
                </div>
              ))
            )}
          </div>
        )}
      </Panel>

      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editing}
        defaultDate={format(cursor, "yyyy-MM-dd")}
      />
    </div>
  );
}
