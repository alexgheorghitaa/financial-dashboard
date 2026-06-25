"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { categories, type NewTransactionInput, type Transaction } from "@/lib/mock-data";

const schema = z.object({
  name: z.string().min(2, "Enter a description (min 2 characters)."),
  amount: z.coerce.number().positive("Amount must be greater than 0."),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Pick a category."),
  date: z.string().min(1, "Pick a date."),
  repeat: z.enum(["none", "monthly"]),
});

type FormValues = z.infer<typeof schema>;

const TINTS: Record<string, { tint: string; fg: string }> = {
  income: { tint: "#eaf7ef", fg: "#16a34a" },
  expense: { tint: "#eaf1fb", fg: "#2f6bd4" },
};

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

const fieldClass =
  "h-11 w-full rounded-lg border border-db-line bg-db-card2 px-3 text-sm text-db-text outline-none focus:border-db-accent";

export function AddTransactionDialog({ onAdd }: { onAdd: (ui: Transaction, raw: NewTransactionInput) => void }) {
  const [open, setOpen] = useState(false);
  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "expense", category: "Groceries", date: new Date().toISOString().slice(0, 10), repeat: "none" },
  });

  function submit(values: FormValues) {
    const t = TINTS[values.type];
    const signed = values.type === "income" ? Math.abs(values.amount) : -Math.abs(values.amount);

    const ui: Transaction = {
      id: crypto.randomUUID(),
      name: values.name,
      detail: values.type === "income" ? "Income" : values.category,
      initial: values.name.charAt(0).toUpperCase(),
      tint: t.tint,
      fg: t.fg,
      date: fmtDate(values.date),
      dateISO: values.date,
      category: values.category,
      amount: signed,
      type: values.type,
      status: "Completed",
      repeat: values.repeat,
      endISO: null,
    };

    onAdd(ui, {
      description: values.name,
      amount: values.amount,
      type: values.type,
      category: values.category,
      date: values.date,
      repeat: values.repeat,
    });

    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-[10px] bg-db-accent px-3.5 py-2.5 text-[13.5px] font-semibold text-white transition hover:opacity-90">
          <Plus className="size-[15px]" /> Add transaction
        </button>
      </DialogTrigger>
      <DialogContent className="border-db-line bg-db-card text-db-text sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-db-text">Add transaction</DialogTitle>
          <DialogDescription className="text-db-muted">Record a new income or expense. Demo only — nothing is sent anywhere.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-1.5 block text-db-text2">Description</Label>
            <input id="name" placeholder="e.g. Grocery run" className={fieldClass} {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount" className="mb-1.5 block text-db-text2">Amount (USD)</Label>
              <input id="amount" type="number" step="0.01" placeholder="0.00" className={fieldClass} {...register("amount")} />
              {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div>
              <Label htmlFor="type" className="mb-1.5 block text-db-text2">Type</Label>
              <select id="type" className={fieldClass} {...register("type")}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="category" className="mb-1.5 block text-db-text2">Category</Label>
              <select id="category" className={fieldClass} {...register("category")}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
            </div>
            <div>
              <Label htmlFor="date" className="mb-1.5 block text-db-text2">Date</Label>
              <input id="date" type="date" className={fieldClass} {...register("date")} />
              {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="repeat" className="mb-1.5 block text-db-text2">Repeat</Label>
            <select id="repeat" className={fieldClass} {...register("repeat")}>
              <option value="none">One-time</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-db-line text-db-text2">Cancel</Button>
            <Button type="submit" className="bg-db-accent text-white hover:opacity-90">Add transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
