import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Panel, PanelHeader, SectionTitle } from "@/components/lifeos/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLifeOS } from "@/lib/lifeos/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — LifeOS" },
      {
        name: "description",
        content: "Manage your LifeOS profile, planning preferences, reminders and demo data.",
      },
      { property: "og:title", content: "Settings — LifeOS" },
      { property: "og:description", content: "Profile, planning preferences and reminders." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { state, resetDemo, updateUser } = useLifeOS();
  const [reminders, setReminders] = useState(true);
  const [weeklyEmail, setWeeklyEmail] = useState(false);
  const [autoPlan, setAutoPlan] = useState(true);
  const [name, setName] = useState(state.user.name);
  const [email, setEmail] = useState(state.user.email);

  const onAvatar = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateUser({ avatar: String(reader.result) });
      toast.success("Photo updated");
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    const initials =
      name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("") || state.user.initials;
    updateUser({ name: name.trim() || state.user.name, email: email.trim(), initials });
    toast.success("Profile saved");
  };

  return (
    <div className="space-y-6">
      <header className="pt-2">
        <SectionTitle>Settings</SectionTitle>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          Make LifeOS fit the way you work.
        </p>
      </header>

      <Panel>
        <PanelHeader title="Profile" />
        <div className="grid gap-4 px-6 pb-6 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue={state.user.name} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={state.user.email} />
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Planning" description="How LifeOS shapes your day." />
        <div className="space-y-3 px-6 pb-6">
          {[
            {
              label: "Auto-generate a daily plan",
              hint: "Build a fresh plan each morning from your priorities.",
              value: autoPlan,
              set: setAutoPlan,
            },
            {
              label: "Habit reminders",
              hint: "Gentle nudges at your preferred time.",
              value: reminders,
              set: setReminders,
            },
            {
              label: "Weekly review email",
              hint: "A Sunday summary of the week behind you.",
              value: weeklyEmail,
              set: setWeeklyEmail,
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
            >
              <div>
                <p className="text-[14px] font-medium">{row.label}</p>
                <p className="text-[12.5px] text-muted-foreground">{row.hint}</p>
              </div>
              <Switch checked={row.value} onCheckedChange={row.set} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Data"
          description="Everything lives in this browser for now, ready for a cloud backend later."
        />
        <div className="px-6 pb-6">
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              resetDemo();
              toast.success("Demo data restored");
            }}
          >
            Reset to demo data
          </Button>
        </div>
      </Panel>
    </div>
  );
}
