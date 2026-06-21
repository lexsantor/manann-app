"use client";
import { useTransition } from "react";
import { Crown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeMember, updateMemberRole } from "@/lib/settings-actions";
import { toast } from "@/components/ui/toast";

interface Member {
  memberId: string;
  role: "owner" | "member";
  createdAt: Date;
  userId: string;
  name: string | null;
  email: string;
}

interface Props {
  members: Member[];
  currentMemberId: string;
  isOwner: boolean;
}

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  member: "Miembro",
};

export function MembersTable({ members, currentMemberId, isOwner }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(memberId: string, role: "owner" | "member") {
    startTransition(async () => {
      try {
        await updateMemberRole(memberId, role);
      } catch {
        toast.error("No se pudo cambiar el rol del miembro. Inténtalo de nuevo.");
      }
    });
  }

  function handleRemove(memberId: string) {
    if (!confirm("¿Eliminar este miembro de la organización?")) return;
    startTransition(async () => {
      try {
        await removeMember(memberId);
      } catch {
        toast.error("No se pudo eliminar al miembro. Inténtalo de nuevo.");
      }
    });
  }

  // COLUMNS dentro del componente: las celdas (rol/acciones) leen estado
  // (isPending, isSelf, isOwner) y handlers vía closure.
  const COLUMNS: Column<Member>[] = [
    {
      key: "user",
      header: "Usuario",
      card: "title",
      cell: (m) => {
        const isSelf = m.memberId === currentMemberId;
        return (
          <div className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-sm text-muted-foreground">
              {(m.name ?? m.email)[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium leading-none">{m.name ?? "—"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.email}</p>
            </div>
            {isSelf && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                tú
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "role",
      header: "Rol",
      cell: (m) => {
        const isSelf = m.memberId === currentMemberId;
        return isOwner && !isSelf ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2"
                disabled={isPending}
              >
                {m.role === "owner" && <Crown className="size-3 text-warning" />}
                {ROLE_LABEL[m.role]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleRoleChange(m.memberId, "owner")}>
                <Crown className="mr-2 size-3.5 text-warning" />
                Owner
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange(m.memberId, "member")}>
                Miembro
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="flex items-center gap-1.5">
            {m.role === "owner" && <Crown className="size-3 text-warning" />}
            {ROLE_LABEL[m.role]}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      align: "right",
      card: "hidden",
      cell: (m) => {
        const isSelf = m.memberId === currentMemberId;
        return isOwner && !isSelf ? (
          <Button
            variant="ghost"
            size="sm"
            className="size-7 text-muted-foreground hover:text-destructive"
            disabled={isPending}
            aria-label="Eliminar miembro"
            onClick={() => handleRemove(m.memberId)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        ) : null;
      },
    },
  ];

  return (
    <DataTable
      columns={COLUMNS}
      rows={members}
      getRowKey={(m) => m.memberId}
      caption="Miembros de la organización"
      empty="Sin miembros"
    />
  );
}
