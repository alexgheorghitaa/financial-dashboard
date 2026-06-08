"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, Check } from "lucide-react";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!emailOk(email)) next.email = "Please enter a valid email address.";
    if (!password) next.password = "Please enter your password.";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setLoading(true);
      setTimeout(() => router.push("/dashboard"), 600);
    }
  }

  return (
    <AuthLayout
      badge="Your money, in focus"
      title={<>Every dollar, finally <em className="text-[#22c55e]">accounted for</em>.</>}
      blurb="Log back in to see your balance, spending and savings — all calmly in one place."
      foot="Track balances, income and expenses — all in one clear view."
    >
      <h1 className="text-[30px] font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 mb-7 text-[15px] text-muted-foreground">New to FinTrack? <Link href="/register" className="font-semibold text-[#22c55e]">Create an account</Link></p>

      <form onSubmit={submit} noValidate className="space-y-[18px]">
        <div>
          <Label htmlFor="email" className="mb-2 block">Email address</Label>
          <div className="relative flex items-center">
            <Mail className="pointer-events-none absolute left-3.5 size-[17px] text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-11" />
          </div>
          {errors.email && <p className="mt-1.5 text-[12.5px] text-destructive">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="password" className="mb-2 block">Password</Label>
          <div className="relative flex items-center">
            <Lock className="pointer-events-none absolute left-3.5 size-[17px] text-muted-foreground" />
            <Input id="password" type={show ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 px-11" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 text-muted-foreground" aria-label="Toggle password">{show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}</button>
          </div>
          {errors.password && <p className="mt-1.5 text-[12.5px] text-destructive">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between pt-1">
          <button type="button" onClick={() => setRemember(!remember)} className="flex items-center gap-2.5 text-[13.5px] text-muted-foreground">
            <span className={`flex size-[18px] items-center justify-center rounded-[5px] border ${remember ? "border-[#16a34a] bg-[#16a34a]" : "border-input"}`}>{remember && <Check className="size-3 text-white" strokeWidth={3} />}</span>
            Remember me
          </button>
          <a href="#" className="text-[13.5px] font-semibold text-[#22c55e]">Forgot password?</a>
        </div>

        <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-[#16a34a] text-[15px] text-white hover:bg-[#22c55e]">{loading ? "Signing in…" : "Log in"}</Button>
      </form>

      <p className="mt-7 text-center text-[12.5px] text-[#6A707B]">All figures shown in FinTrack are sample data in this demo.</p>
    </AuthLayout>
  );
}
