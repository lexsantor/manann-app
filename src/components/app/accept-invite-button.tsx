"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { acceptInvitation } from "@/lib/settings-actions";
import { toast } from "@/components/ui/toast";

interface Props {
  token: string;
}

export function AcceptInviteButton({ token }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function accept() {
    startTransition(async () => {
      try {
        const res = await acceptInvitation(token);
        if (res.error) {
          toast.error(res.error);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } catch {
        toast.error("No se pudo aceptar la invitación. Inténtalo de nuevo.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" onClick={accept} disabled={isPending}>
        {isPending ? "Procesando…" : "Aceptar invitación"}
      </Button>
      <p className="text-center text-base text-muted-foreground">
        ¿No quieres unirte?{" "}
        <a href="/dashboard" className="text-primary underline underline-offset-4">
          Ir al dashboard
        </a>
      </p>
    </div>
  );
}
