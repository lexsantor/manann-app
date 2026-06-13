"use client";
import { useState, useTransition } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateOrgName } from "@/lib/settings-actions";

interface Props {
  currentName: string;
  isOwner: boolean;
}

export function OrgNameForm({ currentName, isOwner }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function cancel() {
    setValue(currentName);
    setError(null);
    setEditing(false);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updateOrgName(value);
      if (res.error) {
        setError(res.error);
      } else {
        setEditing(false);
      }
    });
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">Nombre de la organización</p>
      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-8 max-w-xs text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
          />
          <Button size="sm" variant="ghost" className="size-8" onClick={save} disabled={isPending}>
            <Check className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" className="size-8" onClick={cancel}>
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{currentName}</span>
          {isOwner && (
            <Button size="sm" variant="ghost" className="size-6" onClick={() => setEditing(true)}>
              <Pencil className="size-3" />
            </Button>
          )}
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
