"use client";

import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, CartesianGrid, Cell,
} from "recharts";
import { statistics, weeklyExpenses, usd } from "@/lib/mock-data";

function MonthlyTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const inc = payload.find((p: any) => p.dataKey === "income")?.value ?? 0;
  const exp = payload.find((p: any) => p.dataKey === "expenses")?.value ?? 0;
  return (
    <div className="space-y-1.5">
      <div className="rounded-lg bg-db-tooltip px-3 py-1.5 text-[13px] font-bold text-white shadow-lg">
        <span className="mr-1.5 inline-block size-[7px] rounded-full bg-[#22c55e]" />{usd(inc)}
      </div>
      <div className="rounded-lg border border-db-line bg-db-card px-3 py-1.5 text-[13px] font-bold text-db-text shadow-lg">
        <span className="mr-1.5 inline-block size-[7px] rounded-full bg-[#f59e0b]" />{usd(exp)}
      </div>
    </div>
  );
}

function WeeklyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-db-tooltip px-3 py-2 text-[13px] font-bold text-white shadow-lg">
      <div className="mb-0.5 text-[11px] font-medium opacity-70">{label}</div>
      <span className="mr-1.5 inline-block size-[7px] rounded-full bg-[#f59e0b]" />{usd(payload[0].value)}
    </div>
  );
}

const tickStyle = { fill: "var(--db-soft)", fontSize: 12.5 };

export function StatisticsChart({ range = "monthly" }: { range?: "monthly" | "weekly" }) {
  if (range === "weekly") {
    return (
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyExpenses} margin={{ top: 28, right: 6, left: 6, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--db-grid)" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tick={tickStyle} dy={8} />
            <YAxis hide domain={[0, 2600]} />
            <Tooltip content={<WeeklyTooltip />} cursor={{ fill: "var(--db-grid)" }} />
            <Bar dataKey="expenses" radius={[7, 7, 0, 0]} maxBarSize={34}>
              {weeklyExpenses.map((d, i) => (
                <Cell key={i} fill={d.expenses === Math.max(...weeklyExpenses.map((x) => x.expenses)) ? "#16A34A" : "#F59E0B"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={statistics} margin={{ top: 28, right: 6, left: 6, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--db-grid)" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={tickStyle} dy={8} />
          <YAxis hide domain={[3000, 17500]} />
          <ReferenceLine x="Jul" stroke="var(--db-line2)" strokeWidth={1.5} strokeDasharray="4 5" />
          <Tooltip content={<MonthlyTooltip />} cursor={false} />
          <Line type="monotone" dataKey="income" stroke="#16A34A" strokeWidth={3} dot={false} activeDot={{ r: 6.5, fill: "#16A34A", stroke: "var(--db-card)", strokeWidth: 3 }} />
          <Line type="monotone" dataKey="expenses" stroke="#F59E0B" strokeWidth={3} dot={false} activeDot={{ r: 6.5, fill: "#F59E0B", stroke: "var(--db-card)", strokeWidth: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
