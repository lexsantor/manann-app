"use client";
import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inviteMember } from "@/lib/settings-actions";

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function send() {
    if (!email.trim()) return;
    setError(null);
    setSent(false);
    startTransition(async () => {
      const res = await inviteMember(email.trim());
      if (res.error) {
        setError(res.error);
      } else {
        setSent(true);
        setEmail("");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="correo@empresa.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSent(false);
            setError(null);
          }}
          className="h-8 max-w-xs text-base"
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <Button size="sm" className="h-8 gap-1.5" onClick={send} disabled={isPending || !email.trim()}>
          <Send className="size-3.5" />
          Enviar invitación
        </Button>
      </div>
      {error && <p className="text-base text-destructive">{error}</p>}
      {sent && (
        <p className="text-base text-primary">
          Invitación enviada. El enlace expira en 7 días.
        </p>
      )}
    </div>
  );
}
