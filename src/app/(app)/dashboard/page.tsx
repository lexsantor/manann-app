import { getCurrentSession } from "@/lib/session";

export default async function DashboardPage() {
  // Reusa la sesión ya resuelta por el layout (React cache, sin segundo hit).
  const session = await getCurrentSession();
  const name = session?.user.name?.split(" ")[0] ?? "operador";

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-muted-foreground">Panel</p>
      <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-foreground">
        Hola, {name}.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Estás dentro de Manann. Aquí vivirá el panel de expedientes, el tracking
        y el flujo de extracción documental por IA.
      </p>

      <div className="mt-8 rounded-md border border-dashed border-border bg-secondary/[0.04] px-5 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          El panel se construye en PR-5. La autenticación (este acceso) es real.
        </p>
      </div>
    </div>
  );
}
