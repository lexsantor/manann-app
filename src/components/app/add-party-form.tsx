"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Plus, X, Search } from "lucide-react";
import { Icon } from "@/components/icon";
import { addPartyToShipment } from "@/lib/erp-actions";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  role: string;
  taxId: string | null;
  city: string | null;
  country: string | null;
}

interface AddPartyFormProps {
  shipmentId: string;
  contacts: Contact[];
}

const ROLE_OPTIONS = [
  { value: "shipper", label: "Embarcador (Shipper)" },
  { value: "consignee", label: "Consignatario" },
  { value: "notify", label: "Notificado (Notify)" },
  { value: "carrier", label: "Naviera" },
  { value: "agent", label: "Agente" },
  { value: "forwarder", label: "Transitario" },
];

export function AddPartyForm({ shipmentId, contacts }: AddPartyFormProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [role, setRole] = useState("consignee");
  const [suggestions, setSuggestions] = useState<Contact[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (name.length < 1) { setSuggestions([]); return; }
    const q = name.toLowerCase();
    setSuggestions(contacts.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6));
  }, [name, contacts]);

  function pickContact(c: Contact) {
    setName(c.name);
    setRole(c.role);
    setShowSugg(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      role: fd.get("role") as string,
      taxId: fd.get("taxId") as string,
      city: fd.get("city") as string,
      country: fd.get("country") as string,
    };
    startTransition(async () => {
      await addPartyToShipment(shipmentId, data);
      setOpen(false);
      setName("");
      setRole("consignee");
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <Icon icon={Plus} size={13} />
        Añadir parte
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-border bg-surface-2/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Añadir parte</p>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <Icon icon={X} size={14} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name with autocomplete */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 focus-within:border-primary/60">
            <Icon icon={Search} size={13} className="shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              name="name"
              value={name}
              onChange={(e) => { setName(e.target.value); setShowSugg(true); }}
              onFocus={() => setShowSugg(true)}
              onBlur={() => setTimeout(() => setShowSugg(false), 150)}
              placeholder="Nombre del contacto…"
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              required
              autoComplete="off"
            />
          </div>
          {showSugg && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-border bg-card shadow-lg">
              {suggestions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onMouseDown={() => pickContact(c)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-surface-2"
                >
                  <span className="font-medium text-foreground">{c.name}</span>
                  {(c.city ?? c.country) && (
                    <span className="text-xs text-muted-foreground">
                      {[c.city, c.country].filter(Boolean).join(", ")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Role */}
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full appearance-none rounded-md border border-border bg-background px-3 py-1.5 font-mono text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>

        {/* Optional fields */}
        <div className="grid grid-cols-2 gap-2">
          <input
            name="taxId"
            placeholder="NIF/EORI (opcional)"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60"
          />
          <input
            name="country"
            placeholder="País (ES, DE…)"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className={cn(
            "w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity",
            pending && "opacity-60",
          )}
        >
          {pending ? "Añadiendo…" : "Añadir"}
        </button>
      </form>
    </div>
  );
}
