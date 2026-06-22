import { Skeleton, KpiRowSkeleton } from "@/components/ui/skeleton";

// Carga de Reportes: cabecera + KPIs + rejilla de tarjetas de grafico, para
// reflejar la densidad real de la pagina y evitar el salto de layout.
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-56" />
      </div>
      <KpiRowSkeleton />
      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
