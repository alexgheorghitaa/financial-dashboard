"use client";

import { useEffect, useTransition, type ComponentType } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  CheckCheck,
  Repeat,
  Lightbulb,
  Trophy,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import {
  syncNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/dashboard/actions";
import type { NotificationUi } from "@/server/transactions";

const STYLES: Record<string, { Icon: ComponentType<{ className?: string }>; tint: string; fg: string }> = {
  recurring:      { Icon: Repeat,        tint: "#eaf2fd", fg: "#2563eb" },
  "tip-ready":    { Icon: Lightbulb,     tint: "#fef6e7", fg: "#d97706" },
  "goal-reached": { Icon: Trophy,        tint: "#eaf7ef", fg: "#16a34a" },
  "low-balance":  { Icon: AlertTriangle, tint: "#fdecec", fg: "#e11d48" },
  overspend:      { Icon: TrendingDown,  tint: "#fdf0e7", fg: "#ea580c" },
};

export function NotificationsMenu({
  notifications,
  unreadCount,
  onNavigate,
}: {
  notifications: NotificationUi[];
  unreadCount: number;
  onNavigate?: (n: NotificationUi) => void;
}) {
  const [, start] = useTransition();

  // Materialize-on-read: when the dashboard mounts, ask the server to derive any new
  // notifications from real data. Idempotent (skipDuplicates) and only revalidates when
  // something was actually created, so repeat loads are cheap. No setState → lint-safe.
  useEffect(() => {
    void syncNotifications();
  }, []);

  function open(n: NotificationUi) {
    if (n.unread) start(() => void markNotificationRead(n.id));
    onNavigate?.(n);
  }

  function markAll() {
    if (unreadCount > 0) start(() => void markAllNotificationsRead());
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex size-[42px] items-center justify-center rounded-[10px] border border-db-line bg-db-card text-db-text2 outline-none hover:bg-db-card2 focus-visible:ring-2 focus-visible:ring-db-accent/40"
          title="Notifications"
        >
          <Bell className="size-[19px]" />
          {unreadCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[9px] font-bold leading-none text-white ring-2 ring-db-card">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[360px] rounded-2xl border-db-line bg-db-card p-0 text-db-text shadow-[0_18px_50px_rgba(16,24,40,0.18)]"
      >
        <div className="flex items-center justify-between border-b border-db-line px-4 py-3">
          <span className="text-sm font-semibold text-db-text">Notifications</span>
          <button
            onClick={markAll}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-medium text-db-accent transition hover:bg-db-card2 disabled:cursor-default disabled:text-db-soft disabled:hover:bg-transparent"
          >
            <CheckCheck className="size-3.5" /> Mark all read
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-1.5">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-db-card2 text-db-soft">
                <Bell className="size-5" />
              </span>
              <p className="text-sm font-medium text-db-text2">You&apos;re all caught up</p>
              <p className="text-xs text-db-soft">New activity on your account will show up here.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const s = STYLES[n.type] ?? STYLES.recurring;
              return (
                <button
                  key={n.id}
                  onClick={() => open(n)}
                  className="flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-db-card2"
                >
                  <span
                    className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full"
                    style={{ background: s.tint, color: s.fg }}
                  >
                    <s.Icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13.5px] font-semibold text-db-text">{n.title}</span>
                      {n.unread && <span className="size-2 shrink-0 rounded-full bg-db-accent" />}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-db-soft">{n.body}</span>
                    <span className="mt-1 block text-[11px] text-db-soft">{n.when}</span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
