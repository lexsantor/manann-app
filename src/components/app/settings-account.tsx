"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut, Download, Trash2 } from "lucide-react";

import { Icon } from "@/components/icon";
import { Switch } from "@/components/ui/switch";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { SimBadge } from "@/components/ui/sim-badge";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function IconWell({ icon, tone }: { icon: typeof ShieldCheck; tone?: "danger" }) {
  return (
    <div
      className={cn(
        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
        tone === "danger" ? "bg-destructive/10" : "bg-surface-2/40",
      )}
    >
      <Icon icon={icon} size={14} className={tone === "danger" ? "text-destructive" : "text-muted-foreground"} />
    </div>
  );
}

export function SecuritySection() {
  const router = useRouter();
  const [twoFa, setTwoFa] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setTwoFa(localStorage.getItem("security.2fa") === "1");
  }, []);

  function toggle2fa(v: boolean) {
    setTwoFa(v);
    localStorage.setItem("security.2fa", v ? "1" : "0");
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Seguridad</h2>
      <div className="divide-y divide-border rounded-md border bg-card">
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <IconWell icon={ShieldCheck} />
            <div>
              <p className="flex flex-wrap items-center gap-2 text-base font-medium text-foreground">
                Verificación en dos pasos (2FA)
                <SimBadge>Simulación</SimBadge>
              </p>
              <p className="mt-0.5 text-base text-muted-foreground">
                Añade un segundo factor al iniciar sesión. En producción vía TOTP o passkey.
              </p>
            </div>
          </div>
          <Switch checked={twoFa} onCheckedChange={toggle2fa} aria-label="Verificación en dos pasos" />
        </div>
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <IconWell icon={LogOut} />
            <div>
              <p className="text-base font-medium text-foreground">Cerrar sesión</p>
              <p className="mt-0.5 text-base text-muted-foreground">Finaliza tu sesión en este dispositivo.</p>
            </div>
          </div>
          <Button
            variant="secondary"
            disabled={signingOut}
            onClick={() => {
              setSigningOut(true);
              signOut().then(() => router.replace("/login"));
            }}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </section>
  );
}

export function DataPrivacySection() {
  const [simDeleted, setSimDeleted] = useState(false);

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Datos y privacidad
      </h2>
      <div className="divide-y divide-border rounded-md border bg-card">
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <IconWell icon={Download} />
            <div>
              <p className="text-base font-medium text-foreground">Exportar expedientes (CSV)</p>
              <p className="mt-0.5 text-base text-muted-foreground">
                Descarga todos tus expedientes en formato CSV. Portabilidad de datos (RGPD).
              </p>
            </div>
          </div>
          <a
            href="/api/expedientes/export"
            className={cn(buttonVariants({ variant: "secondary" }), "shrink-0 gap-1.5")}
          >
            <Icon icon={Download} size={14} />
            Exportar
          </a>
        </div>
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <IconWell icon={Trash2} tone="danger" />
            <div>
              <p className="flex flex-wrap items-center gap-2 text-base font-medium text-foreground">
                Eliminar organización
                <SimBadge>Simulación</SimBadge>
              </p>
              <p className="mt-0.5 text-base text-muted-foreground">
                Borra la organización y todos sus datos de forma permanente. No se puede deshacer.
              </p>
            </div>
          </div>
          <ConfirmButton
            tone="danger"
            onConfirm={() => setSimDeleted(true)}
            title="¿Eliminar la organización?"
            description="Se eliminarían la organización y todos sus expedientes, facturas y datos. Esta acción no se puede deshacer."
            confirmLabel="Eliminar organización"
            className={cn(buttonVariants({ variant: "destructive" }), "shrink-0 gap-1.5")}
          >
            <Icon icon={Trash2} size={14} />
            Eliminar
          </ConfirmButton>
        </div>
      </div>
      {simDeleted && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <SimBadge>Simulación</SimBadge>
          En producción esto eliminaría la organización y todos sus datos de forma permanente.
        </p>
      )}
    </section>
  );
}
