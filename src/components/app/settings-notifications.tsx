"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import { Icon } from "@/components/icon";
import { Switch } from "@/components/ui/switch";
import { SimBadge } from "@/components/ui/sim-badge";

// Preferencias de notificación — se guardan en localStorage (preferencia real
// del usuario). El ENVÍO de los correos es simulado en la demo (ver SimBadge).
const NOTIF_PREFS = [
  {
    key: "notif.eta",
    label: "Cambios de ETA",
    description: "Avisar cuando cambie la fecha estimada de llegada de un expediente en tránsito.",
    fallback: true,
  },
  {
    key: "notif.docReady",
    label: "Documento listo para revisar",
    description: "Cuando la IA extrae un BL/AWB y deja una propuesta pendiente de confirmar.",
    fallback: true,
  },
  {
    key: "notif.invoiceDue",
    label: "Factura vencida o próxima a vencer",
    description: "Recordatorio de cobros pendientes con el cliente.",
    fallback: true,
  },
  {
    key: "notif.marginAlert",
    label: "Alerta de margen / excepción",
    description: "Cuando un expediente entra en margen negativo o aparece una excepción de facturación.",
    fallback: false,
  },
  {
    key: "notif.dailyDigest",
    label: "Resumen diario por email",
    description: "Un correo cada mañana con el plan del día y lo que requiere tu atención.",
    fallback: false,
  },
];

export function NotificationsSection() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    for (const p of NOTIF_PREFS) {
      const stored = localStorage.getItem(p.key);
      initial[p.key] = stored === null ? p.fallback : stored === "1";
    }
    setPrefs(initial);
    setReady(true);
  }, []);

  function toggle(key: string, v: boolean) {
    setPrefs((prev) => ({ ...prev, [key]: v }));
    localStorage.setItem(key, v ? "1" : "0");
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Notificaciones
        </h2>
        <SimBadge>Simulación · envío real (Resend) en producción</SimBadge>
      </div>
      <div className="divide-y divide-border rounded-md border bg-card">
        {NOTIF_PREFS.map((p) => (
          <div key={p.key} className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-2/40">
                <Icon icon={Bell} size={14} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground">{p.label}</p>
                <p className="mt-0.5 text-base text-muted-foreground">{p.description}</p>
              </div>
            </div>
            <Switch
              checked={!!prefs[p.key]}
              onCheckedChange={(v) => toggle(p.key, v)}
              aria-label={p.label}
              disabled={!ready}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
