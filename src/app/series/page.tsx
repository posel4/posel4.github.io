import Link from "next/link";
import { getAllSeries } from "@/lib/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Series",
  description: "연재 시리즈 목록",
};

export default function SeriesPage() {
  const seriesList = getAllSeries();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">Series</h1>
      <p className="mt-2 text-muted">연재 시리즈별로 묶어 봅니다.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {seriesList.map((series) => (
          <Link
            key={series.name}
            href={`/series/${encodeURIComponent(series.name)}`}
            className="group flex items-center justify-between rounded-xl border border-card-border bg-card-bg p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {series.name}
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {series.count}편
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
