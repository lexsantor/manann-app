"use client";

import { useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";

import { Icon } from "@/components/icon";

interface SearchInputProps {
  defaultValue?: string;
  estado?: string;
}

export function SearchInput({ defaultValue, estado }: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.trim();
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const sp = new URLSearchParams();
      if (estado) sp.set("estado", estado);
      if (v) sp.set("q", v);
      const qs = sp.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    }, 300);
  }

  return (
    <div className="relative flex items-center">
      <Icon
        icon={Search}
        size={14}
        className="pointer-events-none absolute left-3 text-muted-foreground"
      />
      <input
        type="search"
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder="Buscar expediente, naviera, puerto…"
        className="h-11 w-full rounded-md border border-border bg-card pl-9 pr-3 font-sans text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 sm:h-10 sm:w-64"
      />
    </div>
  );
}
