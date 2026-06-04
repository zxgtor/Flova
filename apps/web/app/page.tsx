import { SiteNav } from "@/components/landing/SiteNav";
import { Hero } from "@/components/landing/Hero";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { CommunityShowcase } from "@/components/landing/CommunityShowcase";

export default function LandingPage() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <FeatureGrid />
        <CommunityShowcase />
      </main>
    </>
  );
}
