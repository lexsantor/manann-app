import { Skeleton, KpiRowSkeleton, TableSkeleton } from "@/components/ui/skeleton";

// Estado de carga de las páginas del ERP (Suspense de App Router). Imita la
// estructura típica: cabecera + KPIs + tabla, para evitar saltos de layout.
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <KpiRowSkeleton />
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
