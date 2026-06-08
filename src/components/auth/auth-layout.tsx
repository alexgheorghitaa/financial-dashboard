import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function Logo() {
  return (
    <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-gradient-to-br from-[#22c55e] to-[#0f7a38] shadow-[0_4px_14px_rgba(22,163,74,0.4)]">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 15.5 9 10l4 3.5L20 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="20" cy="6" r="2.2" fill="#fff" /></svg>
    </span>
  );
}

export function AuthLayout({
  children,
  badge,
  title,
  blurb,
  foot,
}: {
  children: React.ReactNode;
  badge: string;
  title: React.ReactNode;
  blurb: string;
  foot: string;
}) {
  return (
    <div className="dark grid min-h-screen grid-cols-1 bg-background text-foreground md:grid-cols-2">
      <div className="flex flex-col overflow-y-auto px-6 py-8 md:px-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-[19px] font-extrabold"><Logo /> FinTrack</Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back home</Link>
        </div>
        <div className="mx-auto my-auto w-full max-w-[400px] py-8">{children}</div>
      </div>

      <div className="relative hidden overflow-hidden bg-[#06080d] md:block">
        <div className="absolute inset-0 bg-[url('/hero-skyline.jpg')] bg-cover bg-[center_38%]" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(155deg,rgba(8,40,24,.42),rgba(8,14,26,.62) 52%,rgba(5,9,16,.88))" }} />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <div className="flex items-center gap-2.5 text-[19px] font-extrabold opacity-90"><Logo /> FinTrack</div>
          <div className="max-w-[440px]">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] text-muted-foreground"><span className="h-[7px] w-[7px] rounded-full bg-[#22c55e] shadow-[0_0_10px_#22c55e]" /> {badge}</span>
            <h2 className="font-serif text-[clamp(34px,3.6vw,50px)] font-normal leading-[1.08] tracking-tight">{title}</h2>
            <p className="mt-4 text-base leading-relaxed text-[#b9c0ca]">{blurb}</p>
          </div>
          <p className="max-w-[420px] text-sm leading-relaxed text-[#b9c0ca]">{foot}</p>
        </div>
      </div>
    </div>
  );
}
