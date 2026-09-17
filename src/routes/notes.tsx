import { createFileRoute } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { NoteCard } from "@/components/lifeos/cards";
import { EmptyState, Panel, SectionTitle, Tag } from "@/components/lifeos/primitives";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLifeOS } from "@/lib/lifeos/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Notes — LifeOS" },
      {
        name: "description",
        content: "A quiet place for ideas, reading lists and thinking — with tags, search and a distraction-free editor.",
      },
      { property: "og:title", content: "Notes — LifeOS" },
      { property: "og:description", content: "Capture ideas in a calm, distraction-free editor." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { state, addNote, updateNote, deleteNote } = useLifeOS();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const allTags = useMemo(
    () => Array.from(new Set(state.notes.flatMap((n) => n.tags))).sort(),
    [state.notes],
  );

  const notes = state.notes
    .filter((n) => (tag ? n.tags.includes(tag) : true))
    .filter((n) =>
      query
        ? `${n.title} ${n.content} ${n.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())
        : true,
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const active = state.notes.find((n) => n.id === openId) ?? null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <div>
          <SectionTitle>Notes</SectionTitle>
          <p className="mt-1.5 text-[14px] text-muted-foreground">Somewhere quiet to think.</p>
        </div>
        <Button
          className="rounded-full"
          onClick={() => {
            const id = addNote({ title: "Untitled note", content: "", tags: [] });
            setOpenId(id);
          }}
        >
          <Plus className="size-4" /> New note
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="h-9 rounded-full bg-card pl-9 text-[13px]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTag(null)}
            className={cn(
              "ring-focus rounded-full border px-3 py-1 text-[12px] transition-colors",
              tag === null
                ? "border-transparent bg-[var(--olive)] text-[var(--warm-white)]"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            All
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className={cn(
                "ring-focus rounded-full border px-3 py-1 text-[12px] transition-colors",
                tag === t
                  ? "border-transparent bg-[var(--olive)] text-[var(--warm-white)]"
                  : "border-border bg-card text-muted-foreground hover:border-[var(--sage)]",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {notes.length === 0 ? (
        <Panel>
          <EmptyState title="Capture an idea" description="Your notes will live here." />
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onClick={() => setOpenId(note.id)} />
          ))}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Edit note</DialogTitle>
          </DialogHeader>
          {active ? (
            <div className="space-y-4">
              <input
                value={active.title}
                onChange={(e) => updateNote(active.id, { title: e.target.value })}
                className="ring-focus w-full bg-transparent text-[22px] font-semibold tracking-tight outline-none"
                placeholder="Note title"
              />
              <Textarea
                value={active.content}
                onChange={(e) => updateNote(active.id, { content: e.target.value })}
                rows={14}
                placeholder="Start writing…"
                className="resize-none border-none bg-transparent px-0 text-[14.5px] leading-relaxed shadow-none focus-visible:ring-0"
              />
              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                {active.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
                <Input
                  placeholder="Add tag…"
                  className="h-7 w-28 rounded-full text-[12px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const value = e.currentTarget.value.trim();
                      if (value && !active.tags.includes(value)) {
                        updateNote(active.id, { tags: [...active.tags, value] });
                      }
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <span className="ml-auto text-[11px] text-muted-foreground">
                  Saved {formatDistanceToNow(new Date(active.updatedAt), { addSuffix: true })}
                </span>
                <button
                  type="button"
                  aria-label="Delete note"
                  onClick={() => {
                    deleteNote(active.id);
                    setOpenId(null);
                    toast.success("Note deleted");
                  }}
                  className="ring-focus rounded-md p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
