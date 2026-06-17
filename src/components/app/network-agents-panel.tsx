"use client";

import { useState } from "react";
import { Search, Globe, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type NetworkAgent = {
  id: string;
  name: string;
  country: string;
  city: string | null;
  modes: string[];
  corridors: string[];
  specialties: string[];
  languages: string[];
  contactName: string | null;
  contactEmail: string | null;
  verifiedAt: Date | null;
};

const MODE_LABELS: Record<string, string> = {
  FCL: "FCL",
  LCL: "LCL",
  AIR: "Aéreo",
  ROAD: "Terrestre",
  RAIL: "Ferroviario",
};

const COUNTRIES: Record<string, string> = {
  DE: "Alemania",
  ES: "España",
  CN: "China",
  MA: "Marruecos",
  NO: "Noruega",
  AR: "Argentina",
  AE: "Emiratos Árabes",
  HK: "Hong Kong",
};

export function NetworkAgentsPanel({ agents }: { agents: NetworkAgent[] }) {
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("_all");
  const [filterMode, setFilterMode] = useState("_all");

  const countries = [...new Set(agents.map((a) => a.country))].sort();
  const modes = [...new Set(agents.flatMap((a) => a.modes))].sort();

  const filtered = agents.filter((a) => {
    if (filterCountry !== "_all" && a.country !== filterCountry) return false;
    if (filterMode !== "_all" && !a.modes.includes(filterMode)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        (a.city ?? "").toLowerCase().includes(q) ||
        a.corridors.some((c) => c.toLowerCase().includes(q)) ||
        a.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, ciudad, corredor…"
            className="pl-9"
          />
        </div>
        <Select value={filterCountry} onValueChange={setFilterCountry}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="País" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos los países</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {COUNTRIES[c] ?? c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterMode} onValueChange={setFilterMode}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Modo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos los modos</SelectItem>
            {modes.map((m) => (
              <SelectItem key={m} value={m}>
                {MODE_LABELS[m] ?? m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} agente(s) en la red</p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
          <Globe className="mb-2 h-8 w-8 text-muted-foreground/40" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">Sin resultados</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((agent) => (
            <div
              key={agent.id}
              className="rounded-lg border border-border bg-card p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground">{agent.name}</span>
                    {agent.verifiedAt && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {agent.city ? `${agent.city}, ` : ""}{COUNTRIES[agent.country] ?? agent.country}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {agent.modes.map((m) => (
                  <span
                    key={m}
                    className="inline-flex rounded-md bg-secondary/20 px-1.5 py-0.5 text-xs font-medium text-foreground"
                  >
                    {MODE_LABELS[m] ?? m}
                  </span>
                ))}
              </div>

              {agent.corridors.length > 0 && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {agent.corridors.join(" · ")}
                </p>
              )}

              {agent.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {agent.specialties.map((s) => (
                    <span
                      key={s}
                      className="inline-flex rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {agent.contactEmail && (
                <p className="text-xs text-muted-foreground">
                  {agent.contactName && <span>{agent.contactName} · </span>}
                  <a
                    href={`mailto:${agent.contactEmail}`}
                    className="text-primary hover:underline"
                  >
                    {agent.contactEmail}
                  </a>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
