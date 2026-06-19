"use client";

import { useState, useTransition } from "react";
import { Plug, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { connectConnector, disconnectConnector } from "@/lib/connector-actions";

type Item = {
  key: string;
  name: string;
  category: string;
  description: string;
  real?: boolean;
  connected: boolean;
};

export function ConectoresPanel({ items }: { items: Item[] }) {
  const [list, setList] = useState(items);
  const [configKey, setConfigKey] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isPending, startTransition] = useTransition();

  const configItem = list.find((i) => i.key === configKey);
  const categories = [...new Set(list.map((i) => i.category))];

  function connect() {
    if (!configKey) return;
    const key = configKey;
    startTransition(async () => {
      await connectConnector(key, { apiKey });
      setList((prev) => prev.map((i) => (i.key === key ? { ...i, connected: true } : i)));
      setConfigKey(null);
      setApiKey("");
    });
  }

  function disconnect(key: string) {
    startTransition(async () => {
      await disconnectConnector(key);
      setList((prev) => prev.map((i) => (i.key === key ? { ...i, connected: false } : i)));
    });
  }

  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <div key={cat} className="space-y-3">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{cat}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.filter((i) => i.category === cat).map((i) => (
              <div key={i.key} className="flex flex-col rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex size-9 items-center justify-center rounded-md border border-border bg-background">
                    <Plug className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  </span>
                  {i.connected ? (
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-mono text-[10px] font-medium text-success">
                      <Check className="h-3 w-3" /> Conectado
                    </span>
                  ) : (
                    <span className="inline-flex w-fit rounded-full bg-muted/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      Disponible
                    </span>
                  )}
                </div>
                <h3 className="mt-3 font-display text-base font-medium tracking-tight text-foreground">{i.name}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{i.description}</p>
                <div className="mt-3">
                  {i.real ? (
                    <span className="font-mono text-xs text-muted-foreground">Operativo</span>
                  ) : i.connected ? (
                    <button
                      onClick={() => disconnect(i.key)}
                      disabled={isPending}
                      className="text-xs text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
                    >
                      Desconectar
                    </button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => setConfigKey(i.key)}>
                      Conectar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-md border border-warning/20 bg-warning/5 px-3 py-2">
        <p className="text-xs text-warning">
          ShipsGo, Gemini y Resend están operativos. El resto son conexiones simuladas — integración real en producción.
        </p>
      </div>

      {configItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => !isPending && setConfigKey(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
                Conectar {configItem.name}
              </h2>
              <button onClick={() => !isPending && setConfigKey(null)} className="rounded-md p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Introduce tus credenciales de {configItem.name}.</p>
            <div className="mt-4 space-y-1.5">
              <label htmlFor="conectores-api-key" className="text-sm font-medium text-foreground">API key / token</label>
              <Input id="conectores-api-key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="••••••••••" />
            </div>
            <div className="mt-3 rounded-md border border-warning/20 bg-warning/5 px-3 py-2">
              <p className="text-xs text-warning">
                Simulación — la conexión real con {configItem.name} se habilita en producción.
              </p>
            </div>
            <Button className="mt-4 w-full" onClick={connect} disabled={isPending}>
              Conectar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
