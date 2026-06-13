"use client";
import { useTransition } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { switchOrg } from "@/lib/org-actions";
import { cn } from "@/lib/utils";

interface Org {
  orgId: string;
  orgName: string;
}

interface Props {
  orgs: Org[];
  activeOrgId: string;
  activeOrgName: string;
}

export function OrgSwitcher({ orgs, activeOrgId, activeOrgName }: Props) {
  const [isPending, startTransition] = useTransition();

  if (orgs.length < 2) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-base transition-colors",
            "text-foreground hover:bg-surface-2",
            isPending && "opacity-60",
          )}
          disabled={isPending}
        >
          <span className="flex-1 truncate font-medium">{activeOrgName}</span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.orgId}
            onClick={() =>
              startTransition(async () => {
                await switchOrg(org.orgId);
              })
            }
            className="gap-2"
          >
            <span className="flex-1 truncate">{org.orgName}</span>
            {org.orgId === activeOrgId && (
              <Check className="size-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
