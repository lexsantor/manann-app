"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactosTabSelectProps {
  tabs: { key: string; label: string }[];
  current: string;
}

// Selector de pestañas para móvil (en escritorio se muestran como tabs).
export function ContactosTabSelect({ tabs, current }: ContactosTabSelectProps) {
  const router = useRouter();
  return (
    <Select value={current} onValueChange={(v) => router.push(`/contactos?tab=${v}`)}>
      <SelectTrigger className="w-full sm:hidden">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {tabs.map((t) => (
          <SelectItem key={t.key} value={t.key}>
            {t.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
