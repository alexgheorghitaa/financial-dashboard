"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { CreateAccountDialog } from "@/components/dashboard/create-account-dialog";
import { SearchCommand, type SearchItem } from "@/components/dashboard/search-command";
import { NotificationsMenu } from "@/components/dashboard/notifications-menu";
import { signOut } from "next-auth/react";
import { ChevronDown, ChevronsUpDown, ChevronRight, Settings, LogOut, Check, Plus } from "lucide-react";
import type { NotificationUi } from "@/server/transactions";

type TopbarUser = { name?: string | null; email?: string | null; image?: string | null };
type AccountRef = { id: string; name: string };

export function Topbar({
  user,
  accounts,
  activeId,
  accountName,
  onSwitchAccount,
  onCreateAccount,
  tab,
  onHome,
  onOpenSettings,
  searchItems,
  notifications,
  unreadCount,
  onNotificationNavigate,
}: {
  user: TopbarUser;
  accounts: AccountRef[];
  activeId: string;
  accountName: string;
  onSwitchAccount: (id: string) => void;
  onCreateAccount: (name: string) => void;
  tab: string;
  onHome: () => void;
  onOpenSettings: () => void;
  searchItems: SearchItem[];
  notifications: NotificationUi[];
  unreadCount: number;
  onNotificationNavigate?: (n: NotificationUi) => void;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = (user.name ?? "U").trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-db-line bg-db-card px-6 py-2.5">
      <button onClick={onHome} className="flex size-[34px] items-center justify-center rounded-[9px] transition hover:bg-db-card2" title="Dashboard">
        <svg width="30" height="30" viewBox="0 0 32 32"><g fill="#16A34A"><circle cx="16" cy="9.5" r="6" /><circle cx="22.5" cy="16" r="6" /><circle cx="16" cy="22.5" r="6" /><circle cx="9.5" cy="16" r="6" /></g><circle cx="16" cy="16" r="3.4" fill="var(--db-card)" /></svg>
      </button>

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-[10px] border border-db-line px-3 py-2 text-sm font-semibold text-db-text hover:bg-db-card2">
            <span className="max-w-[160px] truncate">{accountName}</span> <ChevronsUpDown className="size-3.5 text-db-soft" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="w-60 rounded-2xl border-db-line bg-db-card p-1.5 text-db-text shadow-[0_18px_50px_rgba(16,24,40,0.18)]"
        >
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-db-soft">Accounts</div>
          {accounts.map((a) => (
            <DropdownMenuItem
              key={a.id}
              onSelect={() => onSwitchAccount(a.id)}
              className="cursor-pointer rounded-lg px-2.5 py-2 text-[13.5px] text-db-text focus:bg-db-card2 focus:text-db-text"
            >
              <span className="flex-1 truncate">{a.name}</span>
              {a.id === activeId && <Check className="size-4 text-db-accent" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="bg-db-line" />
          <DropdownMenuItem
            onSelect={() => { setMenuOpen(false); setCreateOpen(true); }}
            className="cursor-pointer rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-db-accent focus:bg-db-card2 focus:text-db-accent"
          >
            <Plus className="size-4" /> New account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden items-center gap-2.5 text-[15px] text-db-soft md:flex">
        <ChevronRight className="size-4" /><b className="font-semibold text-db-accent">{tab}</b>
      </div>

      <SearchCommand items={searchItems} />

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <NotificationsMenu notifications={notifications} unreadCount={unreadCount} onNavigate={onNotificationNavigate} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-[10px] px-1 outline-none hover:bg-db-card2 focus-visible:ring-2 focus-visible:ring-db-accent/40">
              <Avatar className="size-[38px]"><AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} /><AvatarFallback>{initials}</AvatarFallback></Avatar>
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
              <Avatar className="size-9"><AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} /><AvatarFallback>{initials}</AvatarFallback></Avatar>
              <div className="min-w-0">
                <b className="block truncate text-sm font-semibold text-db-text">{user.name}</b>
                <span className="block truncate text-xs text-db-soft">{user.email}</span>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-db-line" />

            <DropdownMenuItem
              onSelect={onOpenSettings}
              className="cursor-pointer rounded-lg px-2.5 py-2 text-[13.5px] text-db-text focus:bg-db-card2 focus:text-db-text"
            >
              <Settings className="size-4 text-db-soft" /> Settings
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

      <CreateAccountDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={onCreateAccount} />
    </header>
  );
}
