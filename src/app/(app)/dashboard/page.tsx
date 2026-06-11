import Link from "next/link";
import { FileStack, Ship, Landmark, CheckCircle2, ArrowRight } from "lucide-react";

import { getOrgContext, listShipments, computeStats } from "@/lib/erp";
import { KpiCard } from "@/components/app/kpi-card";
import { ShipmentBoardingPass } from "@/components/app/shipment-boarding-pass";
import { DemoResetButton } from "@/components/app/demo-reset-button";
import { Icon } from "@/components/icon";

const TERMINAL = new Set(["entregado", "cerrado"]);

export default async function DashboardPage() {
  const ctx = await getOrgContext();
  const name = ctx?.user.name?.split(" ")[0] ?? "operador";

  if (!ctx?.org) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-3xl font-medium tracking-tight text-foreground">
          Hola, {name}.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Tu usuario aún no está asignado a ninguna organización.
        </p>
      </div>
    );
  }

  const shipments = await listShipments(ctx.org.id);
  const confirmed = shipments.filter((s) => s.status !== "borrador");
  const stats = computeStats(confirmed);
  const active = confirmed.filter((s) => !TERMINAL.has(s.status));

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">{ctx.org.name}</p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground">
          Hola, {name}.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {active.length > 0
            ? `Tienes ${active.length} expediente${active.length === 1 ? "" : "s"} en curso.`
            : "No tienes expedientes en curso ahora mismo."}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Expedientes" value={stats.total} icon={FileStack} />
        <KpiCard label="En tránsito" value={stats.enTransito} icon={Ship} accent />
        <KpiCard label="En aduana" value={stats.enAduana} icon={Landmark} />
        <KpiCard label="Entregados" value={stats.entregados} icon={CheckCircle2} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
            Expedientes activos
          </h2>
          <Link
            href="/expedientes"
            prefetch={false}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver todos
            <Icon icon={ArrowRight} size={15} />
          </Link>
        </div>

        {active.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {active.map((s, i) => (
              <div
                key={s.id}
                className="card-stagger"
                style={{ "--i": Math.min(i, 5) } as React.CSSProperties}
              >
                <ShipmentBoardingPass s={s} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border bg-secondary/[0.04] px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Todos los expedientes están entregados o cerrados.
            </p>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <p className="text-xs text-ink-subtle">
          Entorno de demostración con datos simulados.
        </p>
        <DemoResetButton />
      </div>
    </div>
  );
}
