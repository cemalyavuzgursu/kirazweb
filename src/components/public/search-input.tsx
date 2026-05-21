"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useRef } from "react";

interface SearchInputProps {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  defaultValue = "",
  placeholder = "Ürün ara...",
  className = "",
}: SearchInputProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? "";
    if (q) {
      router.push(`/arama?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <input
        ref={inputRef}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoFocus
        className="w-full h-11 pl-4 pr-12 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition"
        style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)", color: "var(--kt-heading)" }}
      />
      <button
        type="submit"
        className="absolute right-3 p-1 transition"
        style={{ color: "var(--kt-muted)" }}
        aria-label="Ara"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
