"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      // Si el cierre de sesión falla, no dejamos el botón colgado: se reactiva
      // para reintentar, y registramos el error para diagnóstico.
      console.error("El cierre de sesión falló:", error);
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={loading}
    >
      <Icon icon={LogOut} size={16} />
      {loading ? "Saliendo…" : "Salir"}
    </Button>
  );
}
