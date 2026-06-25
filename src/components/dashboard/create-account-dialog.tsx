"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const schema = z.object({ name: z.string().trim().min(1, "Enter an account name.").max(40) });
type FormValues = z.infer<typeof schema>;

const fieldClass =
  "h-11 w-full rounded-lg border border-db-line bg-db-card2 px-3 text-sm text-db-text outline-none focus:border-db-accent";

export function CreateAccountDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (name: string) => void;
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function submit(values: FormValues) {
    onCreate(values.name);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-db-line bg-db-card text-db-text sm:max-w-[340px]">
        <DialogHeader>
          <DialogTitle className="text-db-text">New account</DialogTitle>
          <DialogDescription className="text-db-muted">Create a separate wallet with its own transactions and savings.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label htmlFor="account-name" className="mb-1.5 block text-db-text2">Account name</Label>
            <input id="account-name" placeholder="e.g. Business" className={fieldClass} {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-db-line text-db-text2">Cancel</Button>
            <Button type="submit" className="bg-db-accent text-white hover:opacity-90">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
