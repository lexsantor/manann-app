import { redirect } from "next/navigation";

import { getOrgContext, getUserOrgs, getOrgMembers } from "@/lib/erp";
import { getOrgProfile } from "@/lib/tier-v-actions";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { CommandPalette } from "@/components/app/command-palette";
import { OnboardingWizard } from "@/components/app/onboarding-wizard";
import { CopilotoPanel } from "@/components/app/copiloto-panel";
import { GuidedTour } from "@/components/app/guided-tour";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");

  const userOrgs = await getUserOrgs(ctx.user.id);
  const members = ctx.org ? await getOrgMembers(ctx.org.id) : [];
  const profile = ctx.org ? await getOrgProfile() : null;

  return (
    <div className="min-h-dvh bg-background">
      <AppSidebar
        orgName={ctx.org?.name ?? "—"}
        activeOrgId={ctx.org?.id ?? ""}
        orgs={userOrgs}
        memberCount={members.length}
        city={profile?.city ?? null}
      />
      <div className="lg:pl-64">
        <AppTopbar userName={ctx.user.name ?? ""} userEmail={ctx.user.email} />
        <main id="main-content" className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8">
          {children}
        </main>
      </div>
      <CommandPalette />
      <CopilotoPanel />
      <GuidedTour />
      {ctx.org && !ctx.org.onboarded && <OnboardingWizard />}
    </div>
  );
}
