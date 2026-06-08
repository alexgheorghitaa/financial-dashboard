"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { expenseShares, allExpenses, usd } from "@/lib/mock-data";

export function AllExpenses({ size = 168 }: { size?: number }) {
  return (
    <>
      <p className="text-[15px] font-semibold text-db-text">
        All expenses <span className="text-[12.5px] font-medium text-db-soft">· share of spending</span>
      </p>

      <div className="my-3 flex justify-between gap-2">
        {[
          { k: "Daily", v: allExpenses.daily },
          { k: "Weekly", v: allExpenses.weekly },
          { k: "Monthly", v: allExpenses.monthly },
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

      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={expenseShares}
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
              {expenseShares.map((e) => (
                <Cell key={e.label} fill={e.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11.5px] text-db-soft">{allExpenses.highlight.label}</span>
          <span className="text-[17px] font-bold tracking-tight text-db-text">{usd(allExpenses.highlight.amount)}</span>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2.5">
        {expenseShares.map((e) => (
          <li key={e.label} className="flex items-center gap-2.5 text-sm text-db-text2">
            <i className="size-[9px] rounded-full" style={{ background: e.color }} />
            {e.label}
            <b className="ml-auto font-bold text-db-text">{e.value}%</b>
          </li>
        ))}
      </ul>
    </>
  );
}
