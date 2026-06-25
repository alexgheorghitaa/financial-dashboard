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
import { usd } from "@/lib/mock-data";

const schema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0."),
  repeat: z.enum(["none", "monthly"]),
});
type FormValues = z.infer<typeof schema>;

const fieldClass =
  "h-11 w-full rounded-lg border border-db-line bg-db-card2 px-3 text-sm text-db-text outline-none focus:border-db-accent";

export function AddSavingsDialog({
  onAdd,
  available,
}: {
  onAdd: (input: { amount: number; repeat: "none" | "monthly" }) => void;
  available: number;
}) {
  const [open, setOpen] = useState(false);
  const {
    register, handleSubmit, reset, setError, formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { repeat: "none" },
  });

  function submit(values: FormValues) {
    if (values.amount > available) {
      setError("amount", { message: `You only have ${usd(available)} available.` });
      return;
    }
    onAdd({ amount: values.amount, repeat: values.repeat });
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/15 py-2.5 text-[13.5px] font-semibold text-white backdrop-blur transition hover:bg-white/25">
          <Plus className="size-[15px]" /> Add to savings
        </button>
      </DialogTrigger>
      <DialogContent className="border-db-line bg-db-card text-db-text sm:max-w-[340px]">
        <DialogHeader>
          <DialogTitle className="text-db-text">Add to savings</DialogTitle>
          <DialogDescription className="text-db-muted">Move money into the savings goal · {usd(available)} available.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label htmlFor="savings-amount" className="mb-1.5 block text-db-text2">Amount (USD)</Label>
            <input id="savings-amount" type="number" step="0.01" placeholder="0.00" className={fieldClass} {...register("amount")} />
            {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div>
            <Label htmlFor="savings-repeat" className="mb-1.5 block text-db-text2">Frequency</Label>
            <select id="savings-repeat" className={fieldClass} {...register("repeat")}>
              <option value="none">One-time</option>
              <option value="monthly">Every month</option>
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-db-line text-db-text2">Cancel</Button>
            <Button type="submit" className="bg-db-accent text-white hover:opacity-90">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
