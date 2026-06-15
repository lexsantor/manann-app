"use client";

import { useState, useTransition } from "react";
import { Save, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertOrgProfile } from "@/lib/tier-v-actions";

type OrgProfile = {
  id: string;
  specialties: string[];
  corridors: string[];
  certifications: string[];
  languages: string[];
  monthlyCapacity: number | null;
  bio: string | null;
  city: string | null;
};

function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const v = input.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setInput("");
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button size="sm" variant="secondary" onClick={add} className="shrink-0">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-md bg-secondary/20 px-2 py-0.5 text-xs font-medium text-foreground"
            >
              {v}
              <button
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrgProfilePanel({ initialProfile }: { initialProfile: OrgProfile | undefined }) {
  const [form, setForm] = useState({
    specialties: initialProfile?.specialties ?? [],
    corridors: initialProfile?.corridors ?? [],
    certifications: initialProfile?.certifications ?? [],
    languages: initialProfile?.languages ?? [],
    monthlyCapacity: String(initialProfile?.monthlyCapacity ?? ""),
    bio: initialProfile?.bio ?? "",
    city: initialProfile?.city ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await upsertOrgProfile({
        specialties: form.specialties,
        corridors: form.corridors,
        certifications: form.certifications,
        languages: form.languages,
        monthlyCapacity: form.monthlyCapacity ? Number(form.monthlyCapacity) : undefined,
        bio: form.bio || undefined,
        city: form.city || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Descripción</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Breve descripción de vuestra empresa y propuesta de valor para la red"
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Ciudad / sede</label>
          <Input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="ej. Barcelona"
            className="max-w-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Capacidad mensual estimada (TEU)</label>
          <Input
            type="number"
            value={form.monthlyCapacity}
            onChange={(e) => setForm({ ...form, monthlyCapacity: e.target.value })}
            placeholder="ej. 150"
            className="max-w-xs"
          />
        </div>

        <TagInput
          label="Especialidades logísticas"
          values={form.specialties}
          onChange={(v) => setForm({ ...form, specialties: v })}
          placeholder="ej. perecederos, IMDG, proyecto…"
        />

        <TagInput
          label="Corredores habituales"
          values={form.corridors}
          onChange={(v) => setForm({ ...form, corridors: v })}
          placeholder="ej. Asia-España, Norte Africa…"
        />

        <TagInput
          label="Certificaciones"
          values={form.certifications}
          onChange={(v) => setForm({ ...form, certifications: v })}
          placeholder="ej. ISO 9001, OEA, IATA…"
        />

        <TagInput
          label="Idiomas"
          values={form.languages}
          onChange={(v) => setForm({ ...form, languages: v })}
          placeholder="ej. es, en, fr…"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending} className="gap-2">
          <Save className="h-4 w-4" />
          Guardar perfil
        </Button>
        {saved && (
          <span className="text-sm text-emerald-500">Guardado correctamente</span>
        )}
      </div>
    </div>
  );
}
