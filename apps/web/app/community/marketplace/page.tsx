import { HomeNav } from "@/components/home/HomeNav";
import { Filters } from "@/components/marketplace/Filters";
import { StyleOfMonthBanner } from "@/components/marketplace/StyleOfMonthBanner";
import { StyleGrid } from "@/components/marketplace/StyleGrid";

export default function MarketplacePage() {
  return (
    <>
      <HomeNav />
      <div className="flex">
        <Filters />
        <main className="flex-1 p-6">
          <h1 className="mb-4 font-display text-xl">AI Style Marketplace</h1>
          <StyleOfMonthBanner />
          <StyleGrid />
        </main>
      </div>
    </>
  );
}
