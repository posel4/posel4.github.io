"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface CategorySidebarProps {
  categories: { name: string; count: number }[];
  tags: { name: string; count: number }[];
  totalCount: number;
}

export default function CategorySidebar({
  categories,
  tags,
  totalCount,
}: CategorySidebarProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const activeTag = searchParams.get("tag");
  const isAll = !activeCategory && !activeTag;

  return (
    <aside className="sticky top-24 hidden lg:block w-56 shrink-0 self-start">
      <nav className="space-y-6">
        {/* All Posts */}
        <div>
          <Link
            href="/"
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
              isAll
                ? "border-l-2 border-primary font-semibold text-foreground bg-sidebar-hover"
                : "text-muted hover:text-foreground hover:bg-sidebar-hover"
            }`}
          >
            <span>전체 글</span>
            <span className="text-xs text-muted">{totalCount}</span>
          </Link>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
              카테고리
            </h3>
            <ul className="space-y-0.5">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    href={`/?category=${encodeURIComponent(cat.name)}`}
                    className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      activeCategory === cat.name
                        ? "border-l-2 border-primary font-semibold text-foreground bg-sidebar-hover"
                        : "text-muted hover:text-foreground hover:bg-sidebar-hover"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-muted">{cat.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Divider */}
        {tags.length > 0 && (
          <div className="border-t border-sidebar-border" />
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
              태그
            </h3>
            <ul className="space-y-0.5 max-h-64 overflow-y-auto">
              {tags.map((tag) => (
                <li key={tag.name}>
                  <Link
                    href={`/?tag=${encodeURIComponent(tag.name)}`}
                    className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      activeTag === tag.name
                        ? "border-l-2 border-primary font-semibold text-foreground bg-sidebar-hover"
                        : "text-muted hover:text-foreground hover:bg-sidebar-hover"
                    }`}
                  >
                    <span>#{tag.name}</span>
                    <span className="text-xs text-muted">{tag.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
}
