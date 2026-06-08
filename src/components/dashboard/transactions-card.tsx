"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { usd, type Transaction } from "@/lib/mock-data";
import { Search, MoreHorizontal } from "lucide-react";

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

export function TransactionsCard({
  transactions, onAdd,
}: { transactions: Transaction[]; onAdd: (t: Transaction) => void }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    return transactions.filter((t) => {
      if (filter !== "all" && t.type !== filter) return false;
      if (query && !`${t.name} ${t.category}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filter, query]);

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

      <div className="mb-1 flex gap-1.5">
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
