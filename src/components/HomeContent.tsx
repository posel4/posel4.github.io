"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import CategorySidebar from "./CategorySidebar";
import PostCard from "./PostCard";

interface HomeContentProps {
  allPosts: PostMeta[];
  categories: { name: string; count: number }[];
  tags: { name: string; count: number }[];
}

export default function HomeContent({
  allPosts,
  categories,
  tags,
}: HomeContentProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const activeTag = searchParams.get("tag");
  const [search, setSearch] = useState("");

  const isAll = !activeCategory && !activeTag;

  // Filter by category/tag, then by search
  const filteredPosts = useMemo(() => {
    let posts = allPosts;

    if (activeCategory) {
      posts = posts.filter((p) => p.categories.includes(activeCategory));
    } else if (activeTag) {
      posts = posts.filter((p) => p.tags.includes(activeTag));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return posts;
  }, [allPosts, activeCategory, activeTag, search]);

  const filterLabel = activeCategory
    ? activeCategory
    : activeTag
      ? `#${activeTag}`
      : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex gap-10">
        {/* Desktop Sidebar */}
        <CategorySidebar
          categories={categories}
          tags={tags}
          totalCount={allPosts.length}
        />

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {/* Mobile Category Tabs */}
          <div className="mb-6 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              <Link
                href="/"
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isAll
                    ? "bg-primary text-white"
                    : "bg-card-bg text-muted hover:text-foreground shadow-sm"
                }`}
              >
                전체
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/?category=${encodeURIComponent(cat.name)}`}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeCategory === cat.name
                      ? "bg-primary text-white"
                      : "bg-card-bg text-muted hover:text-foreground shadow-sm"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="글 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-card-bg py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {isAll ? "Latest Posts" : filterLabel}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {isAll
                ? "개발하면서 배운 것들을 기록합니다."
                : `${filteredPosts.length}개의 글`}
            </p>
          </div>

          {/* Post Grid */}
          {filteredPosts.length === 0 ? (
            <div className="py-20 text-center text-muted">
              <p className="text-lg">
                {search ? `"${search}" 검색 결과가 없습니다.` : "해당 글이 없습니다."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
