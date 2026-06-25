"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Wallet, PieChart, FileText, ChevronDown, Check, Menu, ShieldCheck,
} from "lucide-react";

const WORDS = ["money", "spending", "savings", "future", "cashflow"];

const FAQ = [
  { q: "What can I track with FinTrack?", a: "Your balances across accounts, your monthly income and expenses, spending by category, month-by-month statistics, and a running list of transactions — all in one organized dashboard." },
  { q: "How do categories work?", a: "You pick a category for each transaction as you add it — food, rent, income and so on — and FinTrack rolls those into your spending breakdowns and monthly statistics so you can see where your money actually goes." },
  { q: "Can I see how my spending changes over time?", a: "The Statistics view plots your income against your expenses month by month, with running averages, so it's easy to spot trends and see whether you're heading in the right direction." },
  { q: "Can I set and track savings goals?", a: "Yes. Set a goal amount and FinTrack tracks your progress against your balance, so you always know how close you are and what's left to put aside." },
  { q: "Is my data mine to control?", a: "Always. You can edit categories, fix transaction details, or remove anything you've added at any time — your records stay under your control." },
];

const FEATURES = [
  { icon: Wallet, title: "Track every balance", text: "Keep all your accounts together with their balances and a single net-worth number that updates as you add income and expenses." },
  { icon: TrendingUp, title: "Income & expense analytics", text: "Clear charts break down what comes in and what goes out, month over month, so trends jump out instantly." },
  { icon: PieChart, title: "Clear categories", text: "Tag each transaction with a category as you add it, and your spending breakdowns stay accurate and easy to read." },
  { icon: FileText, title: "Reports you'll actually read", text: "Monthly reports summarize your savings, top spends and category splits — ready to review anytime." },
];

function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-gradient-to-br from-[#22c55e] to-[#0f7a38] shadow-[0_4px_14px_rgba(22,163,74,0.4)] ${className}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 15.5 9 10l4 3.5L20 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="20" cy="6" r="2.2" fill="#fff" /></svg>
    </span>
  );
}

const DONUT = [
  { label: "Food & health", pct: 28, color: "#3b9be3" },
  { label: "Entertainments", pct: 26, color: "#22c55e" },
  { label: "Platform", pct: 24, color: "#ef4444" },
  { label: "Shopping", pct: 22, color: "#f59e0b" },
];

function HeroDonut() {
  const C = 2 * Math.PI * 30;
  let acc = 0;
  return (
    <div className="relative shrink-0">
      <svg width="96" height="96" viewBox="0 0 80 80">
        {DONUT.map((s) => {
          const len = (s.pct / 100) * C;
          const angle = -90 + (acc / 100) * 360;
          acc += s.pct;
          return <circle key={s.label} cx="40" cy="40" r="30" fill="none" stroke={s.color} strokeWidth="10" strokeDasharray={`${len} ${C}`} transform={`rotate(${angle} 40 40)`} />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        <span className="text-[15px] font-bold tracking-tight">$6,638</span>
        <span className="mt-0.5 text-[10px] text-[#9aa0aa]">spent</span>
      </div>
    </div>
  );
}

function HeroSpark() {
  return (
    <svg viewBox="0 0 600 150" preserveAspectRatio="none" className="mt-5 h-[150px] w-full">
      <path d="M0,92 C45,86 80,70 145,76 C210,82 245,56 320,62 C395,68 450,80 520,62 C560,52 585,60 600,58" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d="M0,118 C50,114 90,104 150,108 C210,112 250,96 330,100 C410,104 460,114 520,102 C560,96 585,100 600,99" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function HeroMock() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white text-left text-[#0c1116] shadow-[0_40px_120px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
      <div className="flex items-center gap-3 border-b border-[#ECEEF1] bg-white px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-gradient-to-br from-[#22c55e] to-[#0f7a38]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 15.5 9 10l4 3.5L20 6" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <span className="rounded-lg border border-[#E3E6EA] px-3 py-1.5 text-[13px] text-[#5b626c]">Personal account ▾</span>
        <div className="ml-auto flex items-center gap-2 rounded-lg border border-[#ECEEF1] bg-[#F4F5F7] px-4 py-2.5 text-[13px] text-[#9aa0aa]">Search <span className="rounded border border-[#E3E6EA] bg-white px-1.5 text-[11px]">⌘F</span></div>
      </div>
      <div className="p-7">
        <h3 className="text-[28px] font-bold tracking-tight">Good morning, Jaylon</h3>
        <p className="text-sm text-[#8a909a]">This is your finance report</p>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#ECEEF1] p-6">
            <p className="text-sm text-[#8a909a]">My balance</p>
            <p className="mt-2 text-[34px] font-bold leading-tight tracking-tight">$83,172<span className="text-[#B8BdC6]">.64</span></p>
            <p className="mt-1 text-sm font-semibold text-[#16A34A]">+6.7%</p>
            <div className="mt-5 flex gap-2.5 text-[13px] font-semibold">
              <span className="flex-1 rounded-xl bg-[#16A34A] py-3 text-center text-white">Add transaction</span>
              <span className="flex-1 rounded-xl border border-[#E3E6EA] py-3 text-center text-[#2a3038]">Add income</span>
            </div>
          </div>
          <div className="rounded-2xl border border-[#ECEEF1] p-6">
            <p className="text-sm text-[#8a909a]">Monthly income</p>
            <p className="mt-2 text-[34px] font-bold leading-tight tracking-tight">$16,281<span className="text-[#B8BdC6]">.48</span></p>
            <p className="mt-3 text-sm font-semibold text-[#16A34A]">+9.8% <span className="font-medium text-[#8a909a]">vs last month</span></p>
          </div>
          <div className="rounded-2xl border border-[#ECEEF1] p-6">
            <p className="text-sm text-[#8a909a]">All expenses</p>
            <div className="mt-4 flex items-center gap-5">
              <HeroDonut />
              <ul className="flex-1 space-y-2.5 text-[13px]">
                <li className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-[#3b9be3]" /> Food &amp; health <b className="ml-auto font-bold">28%</b></li>
                <li className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-[#22c55e]" /> Entertainments <b className="ml-auto font-bold">26%</b></li>
                <li className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-[#ef4444]" /> Platform <b className="ml-auto font-bold">24%</b></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[#ECEEF1] p-6">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold tracking-tight">Statistics</h4>
            <span className="rounded-lg border border-[#E3E6EA] px-3 py-1.5 text-[13px] font-semibold text-[#3a4048]">Monthly</span>
          </div>
          <div className="mt-3 flex gap-5 text-[13px] text-[#6a707b]">
            <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-[#16A34A]" /> Total income</span>
            <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-[#F59E0B]" /> Total expenses</span>
          </div>
          <HeroSpark />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [word, setWord] = useState(0);
  const [out, setOut] = useState(false);
  const [tilt, setTilt] = useState(16);
  const [open, setOpen] = useState<number | null>(0);
  const [menu, setMenu] = useState(false);
  const mockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setOut(true);
      setTimeout(() => { setWord((w) => (w + 1) % WORDS.length); setOut(false); }, 350);
    }, 2400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = mockRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.92, end = vh * 0.28;
      let a = 0;
      if (r.top >= start) a = 16;
      else if (r.top <= end) a = 0;
      else a = ((r.top - end) / (start - end)) * 16;
      setTilt(Math.max(0, Math.min(16, a)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="fixed left-0 right-0 top-[18px] z-50 flex justify-between gap-3 px-[22px]">
        <div className="flex items-center gap-6 rounded-2xl border border-border bg-[rgba(14,17,23,0.55)] px-4 py-2.5 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight"><Logo /> FinTrack</Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</a>
          </nav>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-[rgba(14,17,23,0.55)] p-2 backdrop-blur-xl">
          <Button asChild variant="ghost" size="sm" className="rounded-full text-foreground"><Link href="/login">Log in</Link></Button>
          <Button asChild size="sm" className="rounded-full bg-[#16a34a] text-white hover:bg-[#22c55e]"><Link href="/register">Get started</Link></Button>
          <button onClick={() => setMenu(!menu)} className="p-1.5 md:hidden" aria-label="Menu"><Menu className="size-5" /></button>
        </div>
      </header>

      <section className="relative flex min-h-screen flex-col items-center px-5 pt-[170px] pb-20 text-center">
        <div className="absolute inset-0 z-0 bg-[#05080f] bg-[url('/hero-skyline.jpg')] bg-cover bg-[center_30%]" />
        <div className="absolute inset-0 z-[1]" style={{ background: "radial-gradient(95% 70% at 50% 40%, rgba(5,8,14,.80) 0%, rgba(5,8,14,.50) 42%, rgba(5,8,14,.14) 72%, rgba(5,8,14,0) 100%),linear-gradient(180deg, rgba(5,8,14,.55) 0%, rgba(5,8,14,.05) 20%, rgba(5,8,14,.08) 52%, rgba(8,11,18,.72) 82%, #0a0c10 100%)" }} />
        <div className="relative z-[2] w-full max-w-[880px]">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-3.5 py-1.5 text-[13px] text-muted-foreground"><span className="h-[7px] w-[7px] rounded-full bg-[#22c55e] shadow-[0_0_10px_#22c55e]" /> Personal finance, finally clear</span>
          <h1 className="font-serif text-[clamp(46px,7vw,86px)] font-normal leading-[1.02] tracking-tight">
            Take control<br />of your <span className={`rot-word ${out ? "out" : ""}`}>{WORDS[word]}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[540px] text-[clamp(16px,1.4vw,19px)] leading-relaxed text-[#c4c9d2]">Track every account, see where your money goes, and grow your savings — all in one calm, beautifully simple dashboard.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-full bg-[#16a34a] px-7 py-6 text-base text-white hover:bg-[#22c55e]"><Link href="/register">Get started — it&apos;s free</Link></Button>
            <Button asChild variant="ghost" className="rounded-full border border-border px-6 py-6 text-base"><a href="#how">See how it works</a></Button>
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-[13px] text-[#6A707B]"><ShieldCheck className="size-4" /> Free to use · See your money clearly, no spreadsheets</p>

        </div>

        <div ref={mockRef} className="relative z-[2] mt-16 w-full max-w-[1200px] [perspective:1600px]">
          <div style={{ transform: `rotateX(${tilt.toFixed(2)}deg)`, transformStyle: "preserve-3d", transition: "transform .08s linear" }} className="origin-top">
            <HeroMock />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1180px] px-6 py-24">
        <div className="text-center">
          <span className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#6A707B]"><span className="h-[7px] w-[7px] rounded-full bg-[#22c55e]" /> Everything in one place</span>
          <h2 className="font-serif text-[clamp(34px,4.4vw,54px)] font-normal leading-tight tracking-tight">A clearer picture of your <em className="text-[#22c55e]">finances</em></h2>
          <p className="mx-auto mt-4 max-w-[560px] text-[17px] leading-relaxed text-muted-foreground">Add your accounts and transactions and FinTrack does the rest — organizing and visualizing your money so decisions get easy.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-[18px] sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:border-white/20">
              <div className="mb-[18px] flex h-[46px] w-[46px] items-center justify-center rounded-[13px] border border-[#22c55e]/25 bg-[#22c55e]/12 text-[#22c55e]"><f.icon className="size-[22px]" /></div>
              <h3 className="text-[19px] font-bold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-[1180px] border-t border-border px-6 py-24">
        <div className="text-center">
          <span className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#6A707B]"><span className="h-[7px] w-[7px] rounded-full bg-[#22c55e]" /> How it works</span>
          <h2 className="font-serif text-[clamp(34px,4.4vw,54px)] font-normal leading-tight tracking-tight">Set up in <em className="text-[#22c55e]">three steps</em></h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-[22px] md:grid-cols-3">
          {[
            { n: "01", t: "Add your accounts", d: "Add your balances and transactions to FinTrack to get a single, organized view of your money in minutes." },
            { n: "02", t: "Watch it organize", d: "As you add transactions, FinTrack builds your balance, income and expense views and sorts them into the categories you choose." },
            { n: "03", t: "Make better calls", d: "Spot trends, track a savings goal and see exactly where your money goes with clear monthly insights." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-7">
              <div className="mb-3.5 font-serif text-[46px] leading-none text-[#22c55e]">{s.n}</div>
              <h3 className="text-[18px] font-semibold tracking-tight">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[1180px] px-6 py-24">
        <div className="text-center">
          <span className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#6A707B]"><span className="h-[7px] w-[7px] rounded-full bg-[#22c55e]" /> FAQ</span>
          <h2 className="font-serif text-[clamp(34px,4.4vw,54px)] font-normal leading-tight tracking-tight">Good <em className="text-[#22c55e]">questions</em></h2>
        </div>
        <div className="mx-auto mt-12 max-w-[760px]">
          {FAQ.map((item, i) => (
            <div key={i} className="mb-3 overflow-hidden rounded-2xl border border-border bg-card">
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left text-[16.5px] font-semibold">
                {item.q}
                <ChevronDown className={`size-5 shrink-0 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              <div className="grid transition-all duration-300" style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-[14.5px] leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-32 text-center">
        <div className="absolute inset-0 z-0" style={{ background: "radial-gradient(80% 130% at 50% 120%,rgba(34,197,94,.22),transparent 60%),#0e1117" }} />
        <div className="relative z-[1] mx-auto max-w-[680px]">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-3.5 py-1.5 text-[13px] text-muted-foreground"><span className="h-[7px] w-[7px] rounded-full bg-[#22c55e]" /> Start today</span>
          <h2 className="font-serif text-[clamp(38px,5.4vw,64px)] font-normal leading-tight tracking-tight">Your money, finally<br />making sense</h2>
          <p className="mx-auto mb-8 mt-4 max-w-[520px] text-[17px] leading-relaxed text-muted-foreground">Stop guessing and start seeing exactly where your money goes — in one calm, simple dashboard.</p>
          <Button asChild className="rounded-full bg-[#16a34a] px-8 py-6 text-base text-white hover:bg-[#22c55e]"><Link href="/register">Get started — it&apos;s free</Link></Button>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-14">
        <div className="mx-auto grid max-w-[1180px] grid-cols-2 gap-9 md:grid-cols-3">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 text-lg font-extrabold"><Logo /> FinTrack</Link>
            <p className="mt-3.5 max-w-[260px] text-[13.5px] leading-relaxed text-muted-foreground">The calm, clear way to track your money, understand your spending and grow your savings.</p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.14em]">Product</h4>
            <a href="#features" className="mb-2.5 block text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#how" className="mb-2.5 block text-sm text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#faq" className="mb-2.5 block text-sm text-muted-foreground hover:text-foreground">FAQ</a>
            <Link href="/dashboard" className="mb-2.5 block text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.14em]">Account</h4>
            <Link href="/login" className="mb-2.5 block text-sm text-muted-foreground hover:text-foreground">Log in</Link>
            <Link href="/register" className="mb-2.5 block text-sm text-muted-foreground hover:text-foreground">Create account</Link>
          </div>
        </div>
        <div className="mx-auto mt-11 flex max-w-[1180px] flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-[13px] text-[#6A707B]">
          <div>© 2026 FinTrack. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
