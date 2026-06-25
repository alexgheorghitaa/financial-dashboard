"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex size-[42px] items-center justify-center rounded-[10px] border border-db-line bg-db-card text-db-text2 transition-colors hover:bg-db-card2"
    >
      {mounted ? (
        isDark ? <Sun className="size-[19px]" /> : <Moon className="size-[19px]" />
      ) : (
        <Moon className="size-[19px]" />
      )}
    </button>
  );
}
