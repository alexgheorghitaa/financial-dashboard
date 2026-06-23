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
import { Minus } from "lucide-react";
import { usd } from "@/lib/mock-data";

const schema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0."),
});
type FormValues = z.infer<typeof schema>;

const fieldClass =
  "h-11 w-full rounded-lg border border-db-line bg-db-card2 px-3 text-sm text-db-text outline-none focus:border-db-accent";

export function WithdrawSavingsDialog({
  onWithdraw,
  saved,
}: {
  onWithdraw: (input: { amount: number }) => void;
  saved: number;
}) {
  const [open, setOpen] = useState(false);
  const {
    register, handleSubmit, reset, setError, formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function submit(values: FormValues) {
    if (values.amount > saved) {
      setError("amount", { message: `You only have ${usd(saved)} saved.` });
      return;
    }
    onWithdraw({ amount: values.amount });
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          disabled={saved <= 0}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/30 px-3 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Minus className="size-[15px]" /> Withdraw
        </button>
      </DialogTrigger>
      <DialogContent className="border-db-line bg-db-card text-db-text sm:max-w-[340px]">
        <DialogHeader>
          <DialogTitle className="text-db-text">Withdraw from savings</DialogTitle>
          <DialogDescription className="text-db-muted">Move money back into your balance · {usd(saved)} saved.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label htmlFor="withdraw-amount" className="mb-1.5 block text-db-text2">Amount (USD)</Label>
            <input id="withdraw-amount" type="number" step="0.01" placeholder="0.00" className={fieldClass} {...register("amount")} />
            {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-db-line text-db-text2">Cancel</Button>
            <Button type="submit" className="bg-db-accent text-white hover:opacity-90">Withdraw</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
