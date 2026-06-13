import { redirect } from "next/navigation";

import { getOrgContext, getUserOrgs } from "@/lib/erp";
import { AppSidebar } from "@/components/app/app-sidebar";
import { CommandPalette } from "@/components/app/command-palette";
import { OnboardingWizard } from "@/components/app/onboarding-wizard";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getOrgContext();
  if (!ctx) redirect("/login");

  const userOrgs = await getUserOrgs(ctx.user.id);

  return (
    <div className="min-h-dvh bg-background">
      <AppSidebar
        userEmail={ctx.user.email}
        userName={ctx.user.name ?? ""}
        orgName={ctx.org?.name ?? "—"}
        activeOrgId={ctx.org?.id ?? ""}
        orgs={userOrgs}
      />
      <div className="lg:pl-60">
        <main id="main-content" className="mx-auto w-full max-w-[1100px] px-5 py-8 sm:px-8">
          {children}
        </main>
      </div>
      <CommandPalette />
      {ctx.org && !ctx.org.onboarded && <OnboardingWizard />}
    </div>
  );
}
