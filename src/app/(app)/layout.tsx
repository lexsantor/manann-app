import { redirect } from "next/navigation";

import { getOrgContext } from "@/lib/erp";
import { AppSidebar } from "@/components/app/app-sidebar";

// Guardia real de sesión (server-side). El middleware solo hace el chequeo
// optimista de cookie; aquí validamos la sesión y cargamos la org del usuario.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");

  return (
    <div className="min-h-dvh bg-background">
      <AppSidebar userEmail={ctx.user.email} orgName={ctx.org?.name ?? "—"} />
      <div className="lg:pl-60">
        <main className="mx-auto w-full max-w-[1100px] px-5 py-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
