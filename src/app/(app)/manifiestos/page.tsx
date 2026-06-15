import { notFound } from "next/navigation";
import { FileStack } from "lucide-react";
import { getOrgContext } from "@/lib/erp";
import { listAirManifests, listManifestEntries } from "@/lib/tier-s-actions";
import { AirManifestsPanel } from "@/components/app/air-manifests-panel";

export default async function ManifiestosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const manifests = await listAirManifests();
  const entriesByManifest: Record<string, Awaited<ReturnType<typeof listManifestEntries>>> = {};
  await Promise.all(
    manifests.map(async (m) => {
      entriesByManifest[m.id] = await listManifestEntries(m.id);
    }),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <FileStack className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Manifiestos aéreos
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            MAWB y desglose de HAWBs por manifiesto
          </p>
        </div>
      </div>

      <AirManifestsPanel manifests={manifests} entriesByManifest={entriesByManifest} />
    </div>
  );
}
