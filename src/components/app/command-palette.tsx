"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "cmdk";
import {
  LayoutDashboard,
  Package,
  Plus,
  MoveRight,
  Sun,
  Moon,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Icon } from "@/components/icon";
import { searchShipmentsForPalette } from "@/lib/erp-actions";

interface ShipmentHit {
  id: string;
  reference: string;
  pol: string | null;
  pod: string | null;
  status: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<ShipmentHit[]>([]);
  const [searching, startSearch] = useTransition();
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    function onOpen() { setOpen(true); }
    document.addEventListener("keydown", onKey);
    window.addEventListener("manann:open-command", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("manann:open-command", onOpen);
    };
  }, []);

  // Load expedientes on open
  useEffect(() => {
    if (!open) return;
    startSearch(async () => {
      const results = await searchShipmentsForPalette("");
      setHits(results);
    });
  }, [open]);

  // Search on query change
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      startSearch(async () => {
        const results = await searchShipmentsForPalette(q);
        setHits(results);
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [q, open]);

  function go(href: string) {
    router.push(href);
    setOpen(false);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center border-b border-border px-3">
        <CommandInput
          placeholder="Buscar expediente, navegar…"
          value={q}
          onValueChange={setQ}
          className="flex h-11 w-full bg-transparent py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {searching && (
          <Icon icon={Loader2} size={14} className="shrink-0 animate-spin text-muted-foreground" />
        )}
      </div>
      <CommandList className="max-h-[320px] overflow-y-auto p-1">
        <CommandEmpty className="py-6 text-center text-base text-muted-foreground">
          Sin resultados.
        </CommandEmpty>

        <CommandGroup heading="Navegar" className="px-1 py-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          <CommandItem onSelect={() => go("/dashboard")} className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-base text-foreground hover:bg-surface-2 aria-selected:bg-surface-2">
            <Icon icon={LayoutDashboard} size={15} className="text-muted-foreground" />
            Panel
          </CommandItem>
          <CommandItem onSelect={() => go("/expedientes")} className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-base text-foreground hover:bg-surface-2 aria-selected:bg-surface-2">
            <Icon icon={Package} size={15} className="text-muted-foreground" />
            Expedientes
          </CommandItem>
          <CommandItem onSelect={() => go("/expedientes?accion=nuevo")} className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-base text-foreground hover:bg-surface-2 aria-selected:bg-surface-2">
            <Icon icon={Plus} size={15} className="text-muted-foreground" />
            Nuevo expediente
          </CommandItem>
        </CommandGroup>

        {hits.length > 0 && (
          <>
            <CommandSeparator className="my-1 h-px bg-border" />
            <CommandGroup heading="Expedientes" className="px-1 py-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {hits.map((s) => (
                <CommandItem
                  key={s.id}
                  value={s.reference}
                  onSelect={() => go(`/expedientes/${s.id}`)}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-base text-foreground hover:bg-surface-2 aria-selected:bg-surface-2"
                >
                  <Icon icon={MoveRight} size={14} className="shrink-0 text-muted-foreground" />
                  <span className="font-mono font-medium">{s.reference}</span>
                  {s.pol && s.pod && (
                    <span className="ml-1 text-base text-muted-foreground">
                      {s.pol.slice(-3)} → {s.pod.slice(-3)}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator className="my-1 h-px bg-border" />
        <CommandGroup heading="Tema" className="px-1 py-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          <CommandItem
            onSelect={() => { setTheme(resolvedTheme === "dark" ? "light" : "dark"); setOpen(false); }}
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-base text-foreground hover:bg-surface-2 aria-selected:bg-surface-2"
          >
            <Icon icon={resolvedTheme === "dark" ? Sun : Moon} size={15} className="text-muted-foreground" />
            {resolvedTheme === "dark" ? "Tema claro" : "Tema oscuro"}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
