"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, RefreshCw, Lightbulb } from "lucide-react";
import { generateTip } from "@/app/dashboard/actions";

export function TipCard({
  tip,
  canRefresh,
  hoursLeft,
}: {
  tip: string | null;
  canRefresh: boolean;
  hoursLeft: number;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const locked = !canRefresh;

  function generate() {
    if (locked) return;
    setError(null);
    start(async () => {
      const res = await generateTip();
      if (res.error) setError(res.error);
    });
  }

  return (
    <Card className="flex min-h-[186px] flex-col rounded-2xl border-db-line bg-db-card p-[18px]" style={{ boxShadow: "var(--db-shadow)" }}>
      <div className="flex items-center justify-between">
        <span className="flex size-[42px] items-center justify-center rounded-full bg-db-accentweak text-db-accent"><Lightbulb className="size-5" /></span>
        <button
          onClick={generate}
          disabled={pending || locked}
          title={locked ? `Available again in about ${hoursLeft}h` : "Refresh tip"}
          className="rounded-md p-1.5 text-db-soft transition hover:bg-db-card2 hover:text-db-text2 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} />
        </button>
      </div>
      <p className="mt-3 text-sm font-medium text-db-muted">Tip of the day</p>

      {pending ? (
        <p className="mt-2 text-[13.5px] text-db-soft">Thinking…</p>
      ) : tip ? (
        <p className="mt-2 text-[13.5px] leading-snug text-db-text2">{tip}</p>
      ) : (
        <button onClick={generate} className="mt-2 inline-flex items-center gap-2 self-start rounded-xl bg-db-accent px-3 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">
          <Sparkles className="size-4" /> Generate tip
        </button>
      )}

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {!error && tip && !pending && (
        <p className="mt-auto pt-2 text-[11.5px] text-db-soft">
          {locked ? `Next tip in about ${hoursLeft}h.` : "Refresh for an updated tip."}
        </p>
      )}
    </Card>
  );
}
