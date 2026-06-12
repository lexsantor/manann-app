import Link from "next/link";
import { Logo } from "@/components/logo";

import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      {/* Atmospheric mesh — positional radial gradients, no blur filter needed */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/3 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.09)_0%,transparent_65%)]" />
        <div className="absolute bottom-0 right-1/3 h-[480px] w-[480px] translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--secondary)/0.07)_0%,transparent_65%)]" />
      </div>
      <header className="flex items-center justify-between px-5 py-5 sm:px-6">
        <Link href="/" aria-label="Manann"><Logo /></Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-5 pb-24">
        {children}
      </main>
    </div>
  );
}
