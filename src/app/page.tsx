import { neon } from "@neondatabase/serverless";
import { ThemeToggle } from "@/components/theme-toggle";

// Lectura de Neon en vivo en cada request (no horneada en build).
export const dynamic = "force-dynamic";

// Server Component: lee de Neon en el servidor para probar el pipeline end-to-end.
async function pingNeon(): Promise<{ ok: boolean; detail: string }> {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = (await sql`select now() as ts`) as { ts: string }[];
    return { ok: true, detail: new Date(rows[0].ts).toISOString() };
  } catch (error: unknown) {
    // Detalle solo en el log del servidor; nunca al cliente anónimo.
    console.error("[neon] ping falló:", error);
    return { ok: false, detail: "sin conexión" };
  }
}

export default async function Home() {
  const neonStatus = await pingNeon();

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <p className="eyebrow">PR-1 · pipeline vivo</p>

      <h1 className="font-display text-6xl font-medium tracking-tight sm:text-7xl">
        Manann
      </h1>

      <p className="max-w-md font-sans text-lg text-muted-foreground">
        El sistema conoce la ruta. Tú no remas.
      </p>

      <div className="rounded-md border border-border bg-card px-4 py-3 font-mono text-sm">
        {neonStatus.ok ? (
          <span className="text-primary">
            ● Conectado a Neon · {neonStatus.detail}
          </span>
        ) : (
          <span className="text-destructive">
            ● Sin conexión a Neon · {neonStatus.detail}
          </span>
        )}
      </div>
    </main>
  );
}
