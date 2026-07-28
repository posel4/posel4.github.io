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
    <>
      <section className="relative overflow-hidden border-b border-card-border">
        <div className="paper-grid absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="eyebrow">ENGINEERING JOURNAL</p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.18] tracking-[-.03em] text-foreground sm:text-6xl">
            실시간 시스템을 만들고,
            <br />
            <span className="text-primary">끝까지 운영하며</span> 배운 것들.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            Java와 Spring으로 백엔드를 개발합니다. 성능의 병목을 측정하고,
            장애의 원인을 추적하고, 팀이 더 빠르게 일할 방법을 기록합니다.
          </p>
          <div className="mt-8 flex items-center gap-4 text-sm font-semibold">
            <a href="#posts" className="rounded-full bg-foreground px-5 py-2.5 text-background">
              최근 글 읽기
            </a>
            <Link href="/about" className="text-muted underline decoration-card-border underline-offset-4 hover:text-foreground">
              개발자 소개
            </Link>
          </div>
        </div>
      </section>

      <div id="posts" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex gap-12">
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
          <div className="mb-9">
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
                className="w-full rounded-full border border-card-border bg-card-bg py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/10 transition"
              />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 flex items-end justify-between border-b border-card-border pb-5">
            <div>
              <p className="eyebrow">{isAll ? "LATEST WRITING" : "ARCHIVE"}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">
                {isAll ? "최근 기록" : filterLabel}
              </h2>
            </div>
            <p className="text-sm text-muted">
              {filteredPosts.length}개의 글
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
            <div className="divide-y divide-card-border">
              {filteredPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
}
