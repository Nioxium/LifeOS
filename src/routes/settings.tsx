import { useState } from "react";
import { toast } from "sonner";

import { Panel, PanelHeader, SectionTitle } from "@/components/lifeos/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLifeOS } from "@/lib/lifeos/store";

export default function SettingsPage() {
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
        <PanelHeader title="Profile" description="How you appear across LifeOS." />
        <div className="space-y-4 px-6 pb-6">
          <div className="flex items-center gap-4">
            <span className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-[var(--sand)] text-[18px] font-semibold text-[var(--olive-deep)]">
              {state.user.avatar ? (
                <img src={state.user.avatar} alt="" className="size-full object-cover" />
              ) : (
                state.user.initials
              )}
            </span>
            <div className="flex flex-wrap gap-2">
              <label className="ring-focus inline-flex h-9 cursor-pointer items-center rounded-full border border-border bg-card px-4 text-[13px] font-medium transition-colors hover:bg-accent">
                Upload photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onAvatar(e.target.files?.[0])}
                />
              </label>
              {state.user.avatar ? (
                <Button
                  variant="ghost"
                  className="h-9 rounded-full text-[13px]"
                  onClick={() => updateUser({ avatar: "" })}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <Button className="rounded-full" onClick={saveProfile}>
            Save profile
          </Button>
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
