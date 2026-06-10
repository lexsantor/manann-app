import { redirect } from "next/navigation";
import Link from "next/link";

import { getCurrentSession } from "@/lib/session";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/app/logout-button";

// Guardia real de sesión (server-side). El middleware solo hace un chequeo
// optimista de cookie; aquí validamos contra la sesión de verdad.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5 sm:px-6">
          <Link
            href="/dashboard"
            className="font-display text-xl font-medium tracking-tight text-foreground"
          >
            Manann
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.user.email}
            </span>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
