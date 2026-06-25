"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ArrowRight } from "lucide-react";

export type SearchItem = {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  path?: string;
  keywords: string;
  onSelect: () => void;
};

export function SearchCommand({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const results = q ? items.filter((i) => i.keywords.includes(q)).slice(0, 12) : [];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "f")) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function choose(item: SearchItem) {
    item.onSelect();
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); return; }
    if (!results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); choose(results[active]); }
  }

  const showPanel = open && q.length > 0;

  return (
    <div ref={boxRef} className="relative mx-auto w-full max-w-[520px] flex-1">
      <div className="flex items-center gap-2.5 rounded-[11px] border border-db-line bg-db-card2 px-3.5 py-2.5 text-sm text-db-soft focus-within:border-db-line2">
        <Search className="size-[17px]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search transactions, pages, accounts…"
          className="flex-1 bg-transparent text-db-text outline-none placeholder:text-db-soft"
        />
        <span className="rounded-md border border-db-line bg-db-card px-1.5 py-0.5 text-[11px] font-semibold">⌘K</span>
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[64vh] overflow-auto rounded-xl border border-db-line bg-db-card p-1.5 shadow-[0_18px_50px_rgba(16,24,40,0.18)]">
          {results.length === 0 ? (
            <p className="px-3 py-4 text-sm text-db-soft">No results for “{query}”.</p>
          ) : (
            results.map((item, i) => {
              const header = i === 0 || results[i - 1].group !== item.group;
              return (
                <div key={item.id}>
                  {header && <div className="px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-db-soft">{item.group}</div>}
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(item)}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${i === active ? "bg-db-card2" : ""}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-db-text">{item.title}</p>
                      {item.subtitle && <p className="truncate text-xs text-db-soft">{item.subtitle}</p>}
                    </div>
                    {item.path && <span className="hidden whitespace-nowrap text-[11px] text-db-soft sm:block">{item.path}</span>}
                    <ArrowRight className="size-3.5 shrink-0 text-db-soft" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
