"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { shiftMonth, monthLabel } from "@/lib/derive";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ALL = "all";

export function PeriodSwitcher({
  selectedMonth,
  nowKey,
  onSelect,
  allowAll = false,
}: {
  selectedMonth: string;
  nowKey: string;
  onSelect: (monthKey: string) => void;
  allowAll?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isAll = allowAll && selectedMonth === ALL;
  const selectedYear = Number((isAll ? nowKey : selectedMonth).slice(0, 4));
  const [viewYear, setViewYear] = useState(selectedYear);

  const canGoNext = !isAll && selectedMonth < nowKey;
  const nowYear = Number(nowKey.slice(0, 4));
  const nowMonthNum = Number(nowKey.slice(5, 7));

  const resetTarget = allowAll ? ALL : nowKey;
  const resetLabel = allowAll ? "All" : "Today";
  const resetDisabled = selectedMonth === resetTarget;

  function openPicker() {
    setViewYear(selectedYear);
    setOpen(true);
  }

  function pick(monthIndex: number) {
    const mm = String(monthIndex + 1).padStart(2, "0");
    onSelect(`${viewYear}-${mm}`);
    setOpen(false);
  }

  return (
    <div className="relative flex items-center gap-1.5">
      <div className="flex items-center rounded-[10px] border border-db-line bg-db-card">
        <button
          onClick={() => onSelect(shiftMonth(selectedMonth, -1))}
          disabled={isAll}
          aria-label="Previous month"
          className="flex size-9 items-center justify-center rounded-l-[10px] text-db-text2 transition hover:bg-db-card2 hover:text-db-text disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="size-[18px]" />
        </button>
        <button
          onClick={openPicker}
          className="flex min-w-[136px] items-center justify-center gap-1.5 px-2 py-2 text-[13.5px] font-semibold text-db-text transition hover:text-db-accent"
        >
          {isAll ? "All transactions" : monthLabel(selectedMonth)}
          <ChevronDown className={`size-[15px] text-db-soft transition ${open ? "rotate-180" : ""}`} />
        </button>
        <button
          onClick={() => onSelect(shiftMonth(selectedMonth, 1))}
          disabled={!canGoNext}
          aria-label="Next month"
          className="flex size-9 items-center justify-center rounded-r-[10px] text-db-text2 transition hover:bg-db-card2 hover:text-db-text disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight className="size-[18px]" />
        </button>
      </div>

      <button
        onClick={() => onSelect(resetTarget)}
        disabled={resetDisabled}
        className="rounded-[10px] border border-db-line px-3 py-2 text-[13px] font-semibold text-db-text2 transition hover:bg-db-card2 hover:text-db-text disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
      >
        {resetLabel}
      </button>

      {open && (
        <>
          <button
            aria-label="Close month picker"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div
            className="absolute left-0 top-full z-20 mt-2 w-[248px] rounded-xl border border-db-line bg-db-card p-3"
            style={{ boxShadow: "var(--db-shadow)" }}
          >
            <div className="mb-2.5 flex items-center justify-between">
              <button
                onClick={() => setViewYear((y) => y - 1)}
                aria-label="Previous year"
                className="flex size-7 items-center justify-center rounded-md text-db-text2 transition hover:bg-db-card2 hover:text-db-text"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="text-sm font-bold text-db-text">{viewYear}</span>
              <button
                onClick={() => setViewYear((y) => y + 1)}
                disabled={viewYear >= nowYear}
                aria-label="Next year"
                className="flex size-7 items-center justify-center rounded-md text-db-text2 transition hover:bg-db-card2 hover:text-db-text disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((m, i) => {
                const isFuture = viewYear > nowYear || (viewYear === nowYear && i + 1 > nowMonthNum);
                const isSel = selectedMonth === `${viewYear}-${String(i + 1).padStart(2, "0")}`;
                return (
                  <button
                    key={m}
                    disabled={isFuture}
                    onClick={() => pick(i)}
                    className={`rounded-lg py-2 text-[13px] font-semibold transition ${
                      isSel ? "bg-db-accent text-white" : "text-db-text2 hover:bg-db-card2"
                    } disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
