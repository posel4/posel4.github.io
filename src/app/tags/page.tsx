import Link from "next/link";
import { getAllTags } from "@/lib/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags",
  description: "전체 태그 목록",
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">Tags</h1>
      <p className="mt-2 text-muted">태그별로 글을 찾아봅니다.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {tags.map((tag) => (
          <Link
            key={tag.name}
            href={`/tags/${encodeURIComponent(tag.name)}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-card-border px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary hover:text-primary hover:shadow-sm"
          >
            {tag.name}
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {tag.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
