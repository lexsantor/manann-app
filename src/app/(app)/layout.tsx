import { redirect } from "next/navigation";

import { getOrgContext, getUserOrgs, getOrgMembers } from "@/lib/erp";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { CommandPalette } from "@/components/app/command-palette";
import { OnboardingWizard } from "@/components/app/onboarding-wizard";
import { CopilotoPanel } from "@/components/app/copiloto-panel";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");

  const userOrgs = await getUserOrgs(ctx.user.id);
  const members = ctx.org ? await getOrgMembers(ctx.org.id) : [];

  return (
    <div className="min-h-dvh bg-background">
      <AppSidebar
        orgName={ctx.org?.name ?? "—"}
        activeOrgId={ctx.org?.id ?? ""}
        orgs={userOrgs}
        memberCount={members.length}
      />
      <div className="lg:pl-60">
        <AppTopbar userName={ctx.user.name ?? ""} userEmail={ctx.user.email} />
        <main id="main-content" className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8">
          {children}
        </main>
      </div>
      <CommandPalette />
      <CopilotoPanel />
      {ctx.org && !ctx.org.onboarded && <OnboardingWizard />}
    </div>
  );
}
