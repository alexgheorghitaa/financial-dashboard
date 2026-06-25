"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { StatisticsChart, type MonthPoint, type WeekPoint } from "@/components/dashboard/statistics-chart";
import { usd } from "@/lib/mock-data";

function Money({ value }: { value: number }) {
  const [int, dec] = usd(value).split(".");
  return <span>{int}<span className="text-db-soft">.{dec}</span></span>;
}

const RANGES = [
  { key: "monthly", label: "Monthly" },
  { key: "weekly", label: "Weekly" },
] as const;

export function StatisticsCard({
  monthlyData,
  weeklyData,
  averages,
  referenceMonth,
  year,
  showAverages = true,
}: {
  monthlyData: MonthPoint[];
  weeklyData: WeekPoint[];
  averages: { income: number; expenses: number };
  referenceMonth?: string;
  year: number;
  showAverages?: boolean;
}) {
  const [range, setRange] = useState<"monthly" | "weekly">("monthly");

  return (
    <Card className="rounded-2xl border-db-line bg-db-card p-[18px]" style={{ boxShadow: "var(--db-shadow)" }}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[17px] font-bold tracking-tight text-db-text">Statistics</h3>
          <div className="mt-2.5 flex gap-5 text-[13.5px] text-db-muted">
            {range === "monthly" ? (
              <>
                <span className="flex items-center gap-2"><i className="size-[9px] rounded-full bg-[#16A34A]" /> Total income</span>
                <span className="flex items-center gap-2"><i className="size-[9px] rounded-full bg-[#F59E0B]" /> Total expenses</span>
              </>
            ) : (
              <span className="flex items-center gap-2"><i className="size-[9px] rounded-full bg-[#F59E0B]" /> Weekly expenses</span>
            )}
          </div>
        </div>
        <div className="flex rounded-[10px] border border-db-line p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-md px-3 py-1.5 text-[13px] font-semibold transition ${
                range === r.key ? "bg-db-accent text-white" : "text-db-text2 hover:text-db-text"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <StatisticsChart range={range} monthlyData={monthlyData} weeklyData={weeklyData} referenceMonth={referenceMonth} />

      {showAverages && (
        <div className="mt-4 grid grid-cols-2 gap-5 border-t border-db-line pt-4">
          <div>
            <p className="mb-1.5 text-[13px] text-db-muted">Average income</p>
            <div className="flex items-baseline gap-2 text-[22px] font-bold tracking-tight text-db-text"><Money value={averages.income} /></div>
            <p className="mt-1.5 text-[13px] text-db-soft">monthly average · {year}</p>
          </div>
          <div>
            <p className="mb-1.5 text-[13px] text-db-muted">Average expenses</p>
            <div className="flex items-baseline gap-2 text-[22px] font-bold tracking-tight text-db-text"><Money value={averages.expenses} /></div>
            <p className="mt-1.5 text-[13px] text-db-soft">monthly average · {year}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
