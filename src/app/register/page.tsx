"use client";
import { signIn } from "next-auth/react";
import { registerUser } from "./actions";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Eye, EyeOff, Check } from "lucide-react";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function strength(v: string) {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return s;
}

export default function RegisterPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const s = useMemo(() => strength(form.password), [form.password]);
  const meter = [
    { w: "0%", c: "#EF4444", t: "Use 8+ characters with letters, numbers & symbols." },
    { w: "25%", c: "#EF4444", t: "Weak password" },
    { w: "50%", c: "#F59E0B", t: "Fair password" },
    { w: "75%", c: "#22C55E", t: "Good password" },
    { w: "100%", c: "#16A34A", t: "Strong password" },
  ][s];

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!emailOk(form.email)) next.email = "Please enter a valid email address.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (!form.confirm || form.confirm !== form.password) next.confirm = "Passwords don't match.";
    if (!terms) next.terms = "Please accept the terms to continue.";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setLoading(true);
      const res = await registerUser({ name: form.name, email: form.email, password: form.password });
      if (res.error) {
        setErrors({ email: res.error });
        setLoading(false);
        return;
      }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <AuthLayout
      badge="Start in two minutes"
      title={<>Begin your <em className="text-[#22c55e]">financial clarity</em> today.</>}
      blurb="Add your accounts, watch FinTrack organize everything, and finally see where your money goes."
      foot="Free to use. Add your accounts and see everything in one place."
    >
      <h1 className="text-[30px] font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 mb-7 text-[15px] text-muted-foreground">Already have one? <Link href="/login" className="font-semibold text-[#22c55e]">Log in</Link></p>

      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="name" className="mb-2 block">Full name</Label>
          <div className="relative flex items-center">
            <User className="pointer-events-none absolute left-3.5 size-[17px] text-muted-foreground" />
            <Input id="name" placeholder="Jaylon Baptista" value={form.name} onChange={set("name")} className="h-12 pl-11" />
          </div>
          {errors.name && <p className="mt-1.5 text-[12.5px] text-destructive">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="email" className="mb-2 block">Email address</Label>
          <div className="relative flex items-center">
            <Mail className="pointer-events-none absolute left-3.5 size-[17px] text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} className="h-12 pl-11" />
          </div>
          {errors.email && <p className="mt-1.5 text-[12.5px] text-destructive">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="password" className="mb-2 block">Password</Label>
          <div className="relative flex items-center">
            <Lock className="pointer-events-none absolute left-3.5 size-[17px] text-muted-foreground" />
            <Input id="password" type={show ? "text" : "password"} placeholder="At least 8 characters" value={form.password} onChange={set("password")} className="h-12 px-11" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 text-muted-foreground" aria-label="Toggle password">{show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}</button>
          </div>
          <div className="mt-2.5 h-[5px] overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full transition-all" style={{ width: meter.w, background: meter.c }} />
          </div>
          <p className="mt-1.5 text-xs text-[#6A707B]">{meter.t}</p>
          {errors.password && <p className="mt-1.5 text-[12.5px] text-destructive">{errors.password}</p>}
        </div>

        <div>
          <Label htmlFor="confirm" className="mb-2 block">Confirm password</Label>
          <div className="relative flex items-center">
            <Lock className="pointer-events-none absolute left-3.5 size-[17px] text-muted-foreground" />
            <Input id="confirm" type="password" placeholder="Re-enter your password" value={form.confirm} onChange={set("confirm")} className="h-12 pl-11" />
          </div>
          {errors.confirm && <p className="mt-1.5 text-[12.5px] text-destructive">{errors.confirm}</p>}
        </div>

        <button type="button" onClick={() => setTerms(!terms)} className="flex items-start gap-2.5 pt-1 text-left text-[13.5px] text-muted-foreground">
          <span className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border ${terms ? "border-[#16a34a] bg-[#16a34a]" : "border-input"}`}>{terms && <Check className="size-3 text-white" strokeWidth={3} />}</span>
          <span>I agree to the <a href="#" className="font-semibold text-[#22c55e]">Terms of Service</a> and <a href="#" className="font-semibold text-[#22c55e]">Privacy Policy</a>.</span>
        </button>
        {errors.terms && <p className="text-[12.5px] text-destructive">{errors.terms}</p>}

        <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-[#16a34a] text-[15px] text-white hover:bg-[#22c55e]">{loading ? "Creating account…" : "Create account"}</Button>
      </form>
    </AuthLayout>
  );
}
