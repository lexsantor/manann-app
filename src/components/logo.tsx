import Image from "next/image";

import { cn } from "@/lib/utils";

// Logo oficial conmutado por tema vía CSS (clases .logo-*-mode en globals.css):
// ambos van en el DOM, el tema activo decide cuál se ve (sin flash de JS).
export function Logo({ className }: { className?: string }) {
  const cls = cn("w-auto", className ?? "h-7");
  return (
    <>
      <Image
        src="/images/navbar_logo_manann_dark-mode.svg"
        alt="Manann"
        width={204}
        height={54}
        priority
        unoptimized
        className={cn("logo-dark-mode", cls)}
      />
      <Image
        src="/images/navbar_logo_manann_light-mode.svg"
        alt="Manann"
        width={204}
        height={54}
        priority
        unoptimized
        className={cn("logo-light-mode", cls)}
      />
    </>
  );
}
