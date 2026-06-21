"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Key, Plus, Trash2, Copy, Check, Loader2 } from "lucide-react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createApiKey, revokeApiKey } from "@/lib/erp-actions";
import { cn } from "@/lib/utils";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";

interface ApiKeyRow {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: Date | null;
  createdAt: Date;
}

interface ApiKeysPanelProps {
  keys: ApiKeyRow[];
}

function formatDate(d: Date | null) {
  if (!d) return "Nunca";
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(d));
}

export function ApiKeysPanel({ keys: initial }: ApiKeysPanelProps) {
  const [keys, setKeys] = useState(initial);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => setKeys(initial), [initial]);

  function handleCreate() {
    if (!newName.trim()) return;
    setError(null);
    start(async () => {
      try {
        const { raw } = await createApiKey(newName);
        setRevealed(raw);
        setNewName("");
        setShowForm(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al crear");
      }
    });
  }

  function handleRevoke(id: string) {
    start(async () => {
      await revokeApiKey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    });
  }

  async function handleCopy() {
    if (!revealed) return;
    await navigator.clipboard.writeText(revealed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon icon={Key} size={15} className="text-muted-foreground" />
          <h2 className="font-display text-base font-medium tracking-tight">API Keys</h2>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" />
          Nueva key
        </Button>
      </div>

      {revealed && (
        <div className="border-b border-warning/20 bg-warning/5 px-5 py-4">
          <p className="font-mono text-xs font-semibold text-warning mb-2">
            Copia esta key ahora — no se mostrará de nuevo
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md border border-border/60 bg-background px-3 py-2 font-mono text-xs text-foreground break-all">
              {revealed}
            </code>
            <button
              onClick={handleCopy}
              aria-label={copied ? "Copiado" : "Copiar API key"}
              className={cn(
                "inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 shrink-0 rounded-md p-2 transition-colors",
                copied ? "text-success bg-success/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
              )}
            >
              <Icon icon={copied ? Check : Copy} size={16} />
            </button>
          </div>
          <button
            onClick={() => setRevealed(null)}
            className="mt-2 text-xs text-muted-foreground/60 hover:text-muted-foreground"
          >
            Confirmar que la guardé
          </button>
        </div>
      )}

      {showForm && (
        <div className="border-b border-border px-5 py-4 bg-surface-2/20">
          <Label htmlFor="nombre-de-la-key">Nombre de la key</Label>
          <div className="mt-1 flex gap-2">
            <Input
              id="nombre-de-la-key"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="p.ej. Producción · WMS interno"
              className="flex-1"
              aria-invalid={!!error}
              aria-describedby={error ? "api-key-error" : undefined}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={pending || !newName.trim()}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Crear"}
            </Button>
          </div>
          {error && <p id="api-key-error" role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
      )}

      {keys.length === 0 && !revealed ? (
        <EmptyState
          icon={<Key strokeWidth={1.5} />}
          title="Sin API keys"
          hint="Crea una para integrar Manann con tus sistemas."
          className="px-5 py-10"
        />
      ) : (
        <ul className="divide-y divide-border/40">
          {keys.map((k) => (
            <li key={k.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{k.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {k.prefix}… · Último uso: {formatDate(k.lastUsedAt)} · Creada: {formatDate(k.createdAt)}
                </p>
              </div>
              <ConfirmButton
                onConfirm={() => handleRevoke(k.id)}
                disabled={pending}
                aria-label="Revocar API key"
                title="Revocar API key"
                description="La clave dejará de funcionar de inmediato y romperá las integraciones que la usen. Esta acción no se puede deshacer."
                confirmLabel="Revocar"
                className="shrink-0 rounded-md p-1.5 text-muted-foreground/60 transition-colors hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4" />
              </ConfirmButton>
            </li>
          ))}
        </ul>
      )}

      <div className="px-5 py-3 border-t border-border/40">
        <p className="font-mono text-[10px] text-muted-foreground/60">
          Envía la key en el header <span className="text-muted-foreground/60">X-Api-Key</span> · Base URL: <span className="text-muted-foreground/60">/api/v1</span>
        </p>
      </div>
    </div>
  );
}
