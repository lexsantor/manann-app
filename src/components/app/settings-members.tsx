"use client";
import { useTransition } from "react";
import { Crown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeMember, updateMemberRole } from "@/lib/settings-actions";

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
    startTransition(async () => { await updateMemberRole(memberId, role); });
  }

  function handleRemove(memberId: string) {
    if (!confirm("¿Eliminar este miembro de la organización?")) return;
    startTransition(async () => { await removeMember(memberId); });
  }

  return (
    <div className="rounded-md border bg-card">
      <table className="w-full text-base">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2.5 text-left text-base font-medium text-muted-foreground">
              Usuario
            </th>
            <th className="px-4 py-2.5 text-left text-base font-medium text-muted-foreground">
              Rol
            </th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const isSelf = m.memberId === currentMemberId;
            return (
              <tr key={m.memberId} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-base text-muted-foreground">
                      {(m.name ?? m.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium leading-none">{m.name ?? "—"}</p>
                      <p className="mt-0.5 text-base text-muted-foreground">{m.email}</p>
                    </div>
                    {isSelf && (
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-base text-muted-foreground">
                        tú
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {isOwner && !isSelf ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1.5 px-2 text-base"
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
                    <span className="flex items-center gap-1.5 text-base text-muted-foreground">
                      {m.role === "owner" && <Crown className="size-3 text-warning" />}
                      {ROLE_LABEL[m.role]}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {isOwner && !isSelf && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-7 text-muted-foreground hover:text-destructive"
                      disabled={isPending}
                      onClick={() => handleRemove(m.memberId)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
