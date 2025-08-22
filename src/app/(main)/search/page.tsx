import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import SearchResult from "./SearchResult";

interface PageProps {
  searchParams: Promise<{ q: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;

  return {
    title: `Search results for "${q}"`,
  };
}

export default async function Page({ searchParams }: PageProps) {
  const { q } = await searchParams;

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <h1 className="line-clamp-2 text-center text-2xl font-bold break-all">
            Search results for &quot;{q}&quot;
          </h1>
        </div>
        <SearchResult query={q} />
      </div>
      <TrendsSidebar />
    </main>
  );
}
