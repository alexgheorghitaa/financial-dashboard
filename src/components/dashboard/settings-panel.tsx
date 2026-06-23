"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { usd } from "@/lib/mock-data";

const fieldClass =
  "h-11 w-full rounded-lg border border-db-line bg-db-card2 px-3 text-sm text-db-text outline-none focus:border-db-accent";

function initials(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "U";
}

export function SettingsPanel({
  saved, target, onTargetChange, name, email, onNameChange,
}: {
  saved: number;
  target: number;
  onTargetChange: (n: number) => void;
  name: string;
  email: string;
  onNameChange: (name: string) => void;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [draft, setDraft] = useState(String(target));
  const [justSaved, setJustSaved] = useState(false);
  const [nameDraft, setNameDraft] = useState(name);
  const [nameSaved, setNameSaved] = useState(false);

  function save() {
    const n = Number(draft);
    if (Number.isFinite(n) && n > 0) {
      onTargetChange(n);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1600);
    }
  }

  function saveName() {
    const next = nameDraft.trim();
    if (next.length >= 2) {
      onNameChange(next);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 1600);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="rounded-2xl border-db-line bg-db-card p-6" style={{ boxShadow: "var(--db-shadow)" }}>
        <h3 className="text-[17px] font-bold tracking-tight text-db-text">Profile</h3>
        <p className="mt-1 text-[13.5px] text-db-muted">Your account details.</p>

        <div className="mt-5 flex items-center gap-4">
          <Avatar className="size-16"><AvatarImage src={undefined} alt={name} /><AvatarFallback>{initials(name)}</AvatarFallback></Avatar>
          <div>
            <p className="text-base font-bold text-db-text">{name}</p>
            <p className="text-sm text-db-soft">{email}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="fullname" className="mb-1.5 block text-db-text2">Full name</Label>
            <input id="fullname" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} className={fieldClass} />
            <div className="mt-3 flex items-center gap-3">
              <Button onClick={saveName} className="bg-db-accent text-white hover:opacity-90">Save name</Button>
              {nameSaved && <span className="text-sm font-semibold text-db-accent">Saved ✓</span>}
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-db-text2">Email</Label>
            <input value={email} readOnly disabled className={`${fieldClass} cursor-not-allowed opacity-70`} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-db-line bg-db-card2 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-db-text">Dark mode</p>
              <p className="text-[12.5px] text-db-soft">Switch the dashboard theme</p>
            </div>
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className={`relative h-6 w-11 rounded-full transition-colors ${resolvedTheme === "dark" ? "bg-db-accent" : "bg-db-line2"}`}
            >
              <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${resolvedTheme === "dark" ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border-db-line bg-db-card p-6" style={{ boxShadow: "var(--db-shadow)" }}>
        <h3 className="text-[17px] font-bold tracking-tight text-db-text">Savings goal</h3>
        <p className="mt-1 text-[13.5px] text-db-muted">Set your target for “Emergency fund”.</p>

        <div className="mt-5">
          <Label htmlFor="target" className="mb-1.5 block text-db-text2">Target amount (USD)</Label>
          <input id="target" type="number" min={1} value={draft} onChange={(e) => setDraft(e.target.value)} className={fieldClass} />
        </div>

        <div className="mt-5 rounded-xl border border-db-line bg-db-card2 p-4">
          <div className="mb-2 flex items-baseline justify-between text-[13.5px]">
            <span className="font-bold text-db-text">{usd(saved).replace(".00", "")} saved</span>
            <span className="text-db-soft">of {usd(Number(draft) || target).replace(".00", "")}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-db-line2">
            <span className="block h-full rounded-full bg-db-accent transition-all" style={{ width: `${Math.min(100, Math.round((saved / (Number(draft) || target)) * 100))}%` }} />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={save} className="bg-db-accent text-white hover:opacity-90">Save changes</Button>
          {justSaved && <span className="text-sm font-semibold text-db-accent">Saved ✓</span>}
        </div>
      </Card>
    </div>
  );
}
