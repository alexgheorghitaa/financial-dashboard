"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { usd } from "@/lib/mock-data";

type Share = { label: string; value: number; color: string };
type Totals = { daily: number; weekly: number; monthly: number; highlight: { label: string; amount: number } };

export function AllExpenses({
  shares,
  expenses,
  size = 168,
}: {
  shares: Share[];
  expenses: Totals;
  size?: number;
}) {
  const hasData = shares.length > 0;

  return (
    <>
      <p className="text-[15px] font-semibold text-db-text">
        All expenses <span className="text-[12.5px] font-medium text-db-soft">· share of spending</span>
      </p>

      <div className="my-3 flex justify-between gap-2">
        {[
          { k: "Daily", v: expenses.daily },
          { k: "Weekly", v: expenses.weekly },
          { k: "Monthly", v: expenses.monthly },
        ].map((c) => {
          const [int, dec] = usd(c.v).split(".");
          return (
            <div key={c.k}>
              <p className="mb-1 text-[12.5px] text-db-soft">{c.k}</p>
              <p className="text-base font-bold tracking-tight text-db-text">
                {int}<span className="text-db-soft">.{dec}</span>
              </p>
            </div>
          );
        })}
      </div>

      {hasData ? (
        <>
          <div className="relative mx-auto" style={{ width: size, height: size }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shares}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={size * 0.33}
                  outerRadius={size * 0.5}
                  paddingAngle={3}
                  cornerRadius={6}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {shares.map((e) => (
                    <Cell key={e.label} fill={e.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11.5px] text-db-soft">{expenses.highlight.label}</span>
              <span className="text-[17px] font-bold tracking-tight text-db-text">{usd(expenses.highlight.amount)}</span>
            </div>
          </div>

          <ul className="mt-4 flex flex-col gap-2.5">
            {shares.map((e) => (
              <li key={e.label} className="flex items-center gap-2.5 text-sm text-db-text2">
                <i className="size-[9px] rounded-full" style={{ background: e.color }} />
                {e.label}
                <b className="ml-auto font-bold text-db-text">{e.value}%</b>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div
          className="mx-auto flex flex-col items-center justify-center rounded-full border-[14px] border-db-line/60 text-center"
          style={{ width: size, height: size }}
        >
          <span className="text-[12.5px] text-db-soft">No expenses yet</span>
        </div>
      )}
    </>
  );
}
