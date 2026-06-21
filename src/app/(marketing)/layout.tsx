import { TopNav } from "@/components/marketing/top-nav";
import { Footer } from "@/components/marketing/footer";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grain flex min-h-dvh flex-col">
      <TopNav />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
