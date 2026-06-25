"use client";

import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, CartesianGrid, Cell, type TooltipProps,
} from "recharts";
import { usd } from "@/lib/mock-data";

export type MonthPoint = { month: string; income: number; expenses: number };
export type WeekPoint = { week: string; expenses: number };

function MonthlyTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const inc = Number(payload.find((p) => p.dataKey === "income")?.value ?? 0);
  const exp = Number(payload.find((p) => p.dataKey === "expenses")?.value ?? 0);
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

function WeeklyTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const val = Number(payload[0]?.value ?? 0);
  return (
    <div className="rounded-lg bg-db-tooltip px-3 py-2 text-[13px] font-bold text-white shadow-lg">
      <div className="mb-0.5 text-[11px] font-medium opacity-70">{label}</div>
      <span className="mr-1.5 inline-block size-[7px] rounded-full bg-[#f59e0b]" />{usd(val)}
    </div>
  );
}

const tickStyle = { fill: "var(--db-soft)", fontSize: 12.5 };

export function StatisticsChart({
  range = "monthly",
  monthlyData,
  weeklyData,
  referenceMonth,
}: {
  range?: "monthly" | "weekly";
  monthlyData: MonthPoint[];
  weeklyData: WeekPoint[];
  referenceMonth?: string;
}) {
  if (range === "weekly") {
    const maxWeek = Math.max(0, ...weeklyData.map((x) => x.expenses));
    return (
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 28, right: 6, left: 6, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--db-grid)" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tick={tickStyle} dy={8} />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip content={<WeeklyTooltip />} cursor={{ fill: "var(--db-grid)" }} />
            <Bar dataKey="expenses" radius={[7, 7, 0, 0]} maxBarSize={34} minPointSize={4}>
              {weeklyData.map((d, i) => (
                <Cell key={i} fill={maxWeek > 0 && d.expenses === maxWeek ? "#16A34A" : "#F59E0B"} />
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
        <LineChart data={monthlyData} margin={{ top: 28, right: 6, left: 6, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--db-grid)" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={tickStyle} dy={8} />
          <YAxis hide domain={[0, "auto"]} />
          {referenceMonth && <ReferenceLine x={referenceMonth} stroke="var(--db-line2)" strokeWidth={1.5} strokeDasharray="4 5" />}
          <Tooltip content={<MonthlyTooltip />} cursor={false} />
          <Line type="monotone" dataKey="income" stroke="#16A34A" strokeWidth={3} dot={false} activeDot={{ r: 6.5, fill: "#16A34A", stroke: "var(--db-card)", strokeWidth: 3 }} />
          <Line type="monotone" dataKey="expenses" stroke="#F59E0B" strokeWidth={3} dot={false} activeDot={{ r: 6.5, fill: "#F59E0B", stroke: "var(--db-card)", strokeWidth: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
