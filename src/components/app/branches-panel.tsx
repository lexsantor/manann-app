"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Star } from "lucide-react";
import { createBranch, deleteBranch } from "@/lib/maestros-actions";
import { Button } from "@/components/ui/button";
import { MASTER_COUNTRIES } from "@/lib/master-countries";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Branch {
  id: string;
  code: string;
  name: string;
  address: string | null;
  city: string | null;
  countryCode: string | null;
  isHQ: boolean;
  active: boolean;
}

export function BranchesPanel({ branches: initial }: { branches: Branch[] }) {
  const [branches, setBranches] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [pending, start] = useTransition();
  const [form, setForm] = useState({
    code: "",
    name: "",
    address: "",
    city: "",
    countryCode: "ES",
    isHQ: false,
  });

  function handleCreate() {
    if (!form.code || !form.name) return;
    start(async () => {
      await createBranch({
        code: form.code,
        name: form.name,
        address: form.address || undefined,
        city: form.city || undefined,
        countryCode: form.countryCode || undefined,
        isHQ: form.isHQ,
      });
      setBranches((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          code: form.code,
          name: form.name,
          address: form.address || null,
          city: form.city || null,
          countryCode: form.countryCode || null,
          isHQ: form.isHQ,
          active: true,
        },
      ]);
      setForm({ code: "", name: "", address: "", city: "", countryCode: "ES", isHQ: false });
      setShowForm(false);
    });
  }

  function handleDelete(id: string) {
    start(async () => {
      await deleteBranch(id);
      setBranches((prev) => prev.filter((b) => b.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowForm((v) => !v)} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        Nueva sucursal
      </Button>

      {showForm && (
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Nueva sucursal</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                className="font-mono uppercase"
                placeholder="BCN"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Barcelona"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                placeholder="Barcelona"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>País</Label>
              <Select
                value={form.countryCode}
                onValueChange={(v) => setForm({ ...form, countryCode: v })}
              >
                <SelectTrigger className="w-full" aria-label="País">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MASTER_COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                placeholder="Carrer de l'Exemple 123, 08001"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Checkbox
                checked={form.isHQ}
                onChange={(checked) => setForm({ ...form, isHQ: checked })}
                aria-label="Sede principal (HQ)"
              />
              <Label htmlFor="isHQ">Sede principal (HQ)</Label>
            </div>
          </div>
          <div className="flex gap-2 sm:justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={pending || !form.code || !form.name} className="w-full sm:w-auto">Guardar</Button>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        {branches.length === 0 && (
          <div className="rounded-md border border-border py-8 text-center text-sm text-muted-foreground">
            Sin sucursales configuradas
          </div>
        )}
        {branches.map((b) => (
          <div
            key={b.id}
            className="group flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 hover:border-border/80 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/40 font-mono text-xs font-bold text-muted-foreground">
              {b.code}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground">{b.name}</span>
                {b.isHQ && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    <Star className="h-2.5 w-2.5" strokeWidth={2} />
                    HQ
                  </span>
                )}
              </div>
              {(b.city || b.countryCode) && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[b.city, b.countryCode].filter(Boolean).join(", ")}
                  {b.address && ` · ${b.address}`}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(b.id)}
              disabled={pending}
              className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
