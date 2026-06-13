"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { acceptInvitation } from "@/lib/settings-actions";

interface Props {
  token: string;
}

export function AcceptInviteButton({ token }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function accept() {
    startTransition(async () => {
      const res = await acceptInvitation(token);
      if (res.error) {
        alert(res.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" onClick={accept} disabled={isPending}>
        {isPending ? "Procesando…" : "Aceptar invitación"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        ¿No quieres unirte?{" "}
        <a href="/dashboard" className="text-primary underline underline-offset-4">
          Ir al dashboard
        </a>
      </p>
    </div>
  );
}
