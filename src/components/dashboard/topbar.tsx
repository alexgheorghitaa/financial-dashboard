"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { signOut } from "next-auth/react";
import { Search, Bell, ChevronDown, ChevronsUpDown, ChevronRight, Settings, LogOut } from "lucide-react";

type TopbarUser = { name?: string | null; email?: string | null; image?: string | null };

export function Topbar({user}: { user: TopbarUser }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-db-line bg-db-card px-6 py-2.5">
      <Link href="/" className="flex size-[34px] items-center justify-center rounded-[9px]" title="FinTrack">
        <svg width="30" height="30" viewBox="0 0 32 32"><g fill="#16A34A"><circle cx="16" cy="9.5" r="6" /><circle cx="22.5" cy="16" r="6" /><circle cx="16" cy="22.5" r="6" /><circle cx="9.5" cy="16" r="6" /></g><circle cx="16" cy="16" r="3.4" fill="var(--db-card)" /></svg>
      </Link>

      <button className="flex items-center gap-2 rounded-[10px] border border-db-line px-3 py-2 text-sm font-semibold text-db-text hover:bg-db-card2">
        Personal account <ChevronsUpDown className="size-3.5 text-db-soft" />
      </button>
      <div className="hidden items-center gap-2.5 text-[15px] text-db-soft md:flex">
        <ChevronRight className="size-4" /><b className="font-semibold text-db-accent">Dashboard</b>
      </div>

      <label className="mx-auto flex max-w-[520px] flex-1 items-center gap-2.5 rounded-[11px] border border-db-line bg-db-card2 px-3.5 py-2.5 text-sm text-db-soft focus-within:border-db-line2">
        <Search className="size-[17px]" />
        <input placeholder="Search" className="flex-1 bg-transparent text-db-text outline-none placeholder:text-db-soft" />
        <span className="rounded-md border border-db-line bg-db-card px-1.5 py-0.5 text-[11px] font-semibold">⌘F</span>
      </label>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <button className="relative flex size-[42px] items-center justify-center rounded-[10px] border border-db-line bg-db-card text-db-text2 hover:bg-db-card2"><Bell className="size-[19px]" /><span className="absolute right-2.5 top-2 size-2 rounded-full border-2 border-db-card bg-[#EF4444]" /></button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-[10px] px-1 outline-none hover:bg-db-card2 focus-visible:ring-2 focus-visible:ring-db-accent/40">
              <Avatar className="size-[38px]"><AvatarImage src={user.image??undefined} alt={user.name?? "User"} /><AvatarFallback>JB</AvatarFallback></Avatar>
              <span className="hidden whitespace-nowrap text-left leading-tight md:block">
                <b className="block text-sm font-bold text-db-text">{user.name}</b>
                <span className="text-xs text-db-soft">{user.email}</span>
              </span>
              <ChevronDown className="size-3.5 text-db-soft" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={10}
            className="w-60 rounded-2xl border-db-line bg-db-card p-1.5 text-db-text shadow-[0_18px_50px_rgba(16,24,40,0.18)]"
          >
            <div className="flex items-center gap-3 px-2.5 py-2">
              <Avatar className="size-9"><AvatarImage src={user.image??undefined} alt={user.name?? "User"} /><AvatarFallback>JB</AvatarFallback></Avatar>
              <div className="min-w-0">
                <b className="block truncate text-sm font-semibold text-db-text">{user.name}</b>
                <span className="block truncate text-xs text-db-soft">{user.email}</span>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-db-line" />

            <DropdownMenuItem
              asChild
              className="cursor-pointer rounded-lg px-2.5 py-2 text-[13.5px] text-db-text focus:bg-db-card2 focus:text-db-text"
            >
              <Link href="/dashboard">
                <Settings className="size-4 text-db-soft" /> Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-db-line" />

            <DropdownMenuItem
              onSelect={() => signOut({ redirectTo: "/login" })}
              className="cursor-pointer rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-[#dc2626] focus:bg-[#fef2f2] focus:text-[#dc2626] dark:focus:bg-[#dc2626]/15"
            >
              <LogOut className="size-4 text-[#dc2626]" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
