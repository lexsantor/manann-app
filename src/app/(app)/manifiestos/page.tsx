import { notFound } from "next/navigation";
import { FileStack } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operaciones"
        icon={<FileStack strokeWidth={1.5} />}
        title="Manifiestos aéreos"
        subtitle="MAWB y desglose de HAWBs por manifiesto"
      />

      <AirManifestsPanel manifests={manifests} entriesByManifest={entriesByManifest} />
    </div>
  );
}
