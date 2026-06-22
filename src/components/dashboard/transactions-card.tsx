"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { PeriodSwitcher } from "@/components/dashboard/period-switcher";
import { usd, categories, type Transaction, type NewTransactionInput } from "@/lib/mock-data";
import { Search, MoreHorizontal } from "lucide-react";
import { monthKeyOf } from "@/lib/derive";

const statusClass: Record<string, string> = {
  Completed: "bg-[#EAF7EF] text-[#16A34A] dark:bg-[#16a34a]/15 dark:text-[#4ade80]",
  Pending: "bg-[#FEF6E7] text-[#B7791F] dark:bg-[#f59e0b]/15 dark:text-[#fbbf24]",
  Failed: "bg-[#FDECEC] text-[#DC2626] dark:bg-[#ef4444]/15 dark:text-[#f87171]",
};
const dotClass: Record<string, string> = {
  Completed: "bg-[#16A34A]", Pending: "bg-[#F59E0B]", Failed: "bg-[#EF4444]",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "income", label: "Income" },
  { key: "expense", label: "Expenses" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];
type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "date-desc", label: "Newest first" },
  { key: "date-asc", label: "Oldest first" },
  { key: "amount-desc", label: "Amount: high → low" },
  { key: "amount-asc", label: "Amount: low → high" },
];

const selectClass =
  "h-9 rounded-[10px] border border-db-line bg-db-card2 px-2.5 text-[13px] font-semibold text-db-text2 outline-none focus:border-db-accent";

export function TransactionsCard({
  transactions, onAdd, withControls = false, nowKey = "",
}: {
  transactions: Transaction[];
  onAdd: (ui: Transaction, raw: NewTransactionInput) => void;
  withControls?: boolean;
  nowKey?: string;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [category, setCategory] = useState<string>("all");

  const rows = useMemo(() => {
    let result = transactions.filter((t) => {
      if (filter !== "all" && t.type !== filter) return false;
      if (query && !`${t.name} ${t.category}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });

    if (withControls && monthFilter !== "all") {
      result = result.filter((t) => monthKeyOf(t.dateISO) === monthFilter);
    }

    if (withControls && category !== "all") {
      result = result.filter((t) => t.category === category);
    }

    if (withControls) {
      result = [...result].sort((a, b) => {
        if (sort === "date-asc") return a.dateISO < b.dateISO ? -1 : 1;
        if (sort === "date-desc") return a.dateISO > b.dateISO ? -1 : 1;
        if (sort === "amount-asc") return Math.abs(a.amount) - Math.abs(b.amount);
        return Math.abs(b.amount) - Math.abs(a.amount);
      });
    }

    return result;
  }, [transactions, filter, query, monthFilter, category, sort, withControls]);

  return (
    <Card className="rounded-2xl border-db-line bg-db-card p-[18px]" style={{ boxShadow: "var(--db-shadow)" }}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-[17px] font-bold tracking-tight text-db-text">Transaction and invoices</h3>
          <p className="mt-1 text-[13.5px] text-db-muted">Stay updated on recent financial activity</p>
        </div>
        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-2 rounded-[10px] border border-db-line bg-db-card2 px-3 py-2.5 text-[13.5px] text-db-soft">
            <Search className="size-[15px]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="w-[140px] bg-transparent text-db-text outline-none placeholder:text-db-soft" />
          </label>
          <AddTransactionDialog onAdd={onAdd} />
        </div>
      </div>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                filter === f.key
                  ? "bg-db-accent text-white"
                  : "border border-db-line text-db-text2 hover:bg-db-card2"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {withControls && (
          <div className="flex flex-wrap items-center gap-2.5">
            <PeriodSwitcher selectedMonth={monthFilter} nowKey={nowKey} onSelect={setMonthFilter} allowAll />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass} aria-label="Filter by category">
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={selectClass} aria-label="Sort transactions">
              {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-db-line hover:bg-transparent">
            <TableHead className="text-[12.5px] font-semibold text-db-soft">Transaction</TableHead>
            <TableHead className="text-[12.5px] font-semibold text-db-soft">Date</TableHead>
            <TableHead className="text-[12.5px] font-semibold text-db-soft">Category</TableHead>
            <TableHead className="text-right text-[12.5px] font-semibold text-db-soft">Amount</TableHead>
            <TableHead className="text-[12.5px] font-semibold text-db-soft">Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((t) => (
            <TableRow key={t.id} className="border-db-line hover:bg-db-card2/60">
              <TableCell className="py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex size-[38px] items-center justify-center rounded-[10px] text-sm font-bold" style={{ background: t.tint, color: t.fg }}>{t.initial}</span>
                  <div className="whitespace-nowrap">
                    <b className="block text-sm font-semibold text-db-text">{t.name}</b>
                    <span className="text-[12.5px] text-db-soft">{t.detail}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-db-text2">{t.date}</TableCell>
              <TableCell className="text-sm text-db-text2">{t.category}</TableCell>
              <TableCell className={`text-right text-sm font-bold ${t.amount >= 0 ? "text-[#16A34A] dark:text-[#4ade80]" : "text-db-text"}`}>{usd(t.amount, true)}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold ${statusClass[t.status]}`}>
                  <i className={`size-1.5 rounded-full ${dotClass[t.status]}`} />{t.status}
                </span>
              </TableCell>
              <TableCell className="text-right"><button className="rounded-md p-1.5 text-db-soft hover:bg-db-card2 hover:text-db-text2"><MoreHorizontal className="size-[18px]" /></button></TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow className="border-db-line hover:bg-transparent">
              <TableCell colSpan={6} className="py-10 text-center text-sm text-db-muted">No transactions match this filter.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
