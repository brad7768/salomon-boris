"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onSubmit?: (query: string) => void;
}

export function SearchBar({
  defaultValue = "",
  placeholder = "Rechercher méthodes, cours, tablatures…",
  className,
  autoFocus,
  onSubmit,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (onSubmit) {
      onSubmit(trimmed);
    } else {
      router.push(`/recherche?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-20 py-3.5 bg-white border border-background-neutral rounded-xl text-text placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          aria-label="Recherche"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          Chercher
        </button>
      </div>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
