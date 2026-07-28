"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownEditor";
import type { PostFormData } from "@/components/MarkdownEditor";

export default function WriteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editSlug = searchParams.get("slug");
  const error = searchParams.get("error");

  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<
    Partial<PostFormData> | undefined
  >();
  const [fileSha, setFileSha] = useState<string | undefined>();
  const [publishedDate, setPublishedDate] = useState<string | undefined>();

  // Check session on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setAuthenticated(data.authenticated))
      .catch(() => setAuthenticated(false))
      .finally(() => setCheckingAuth(false));
  }, []);

  // Load existing post for edit mode
  useEffect(() => {
    if (!editSlug || !authenticated) return;

    const loadPost = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts/${editSlug}`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();

        setFileSha(data.sha);
        const post = data.post;
        setPublishedDate(post.date);

        setInitialData({
          title: post.title,
          description: post.description,
          categories: post.categories.join(", "),
          tags: post.tags.join(", "),
          series: post.series,
          seriesOrder: post.seriesOrder,
          cover: post.cover,
          content: post.content,
        });
      } catch (err) {
        console.error("Failed to load post:", err);
        alert("글을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [editSlug, authenticated]);

  const handlePublish = useCallback(
    async (data: PostFormData) => {
      const slug =
        editSlug ||
        data.title
          .toLowerCase()
          .replace(/[^a-z0-9가-힣\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

      const tagList = data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const catList = data.categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      try {
        const res = await fetch("/api/posts/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            sha: fileSha,
            post: {
              ...data,
              date: publishedDate,
              description: data.description || data.content.slice(0, 150),
              categories: catList,
              tags: tagList,
            },
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to publish");
        }

        alert(
          editSlug
            ? "수정 완료! 잠시 후 사이트에 반영됩니다."
            : "발행 완료! 잠시 후 사이트에 반영됩니다."
        );

        router.push(`/posts/${slug}`);
        router.refresh();
      } catch (err) {
        alert(
          "발행 실패: " +
            (err instanceof Error ? err.message : "Unknown error")
        );
      }
    },
    [editSlug, fileSha, publishedDate, router]
  );

  const handleDelete = useCallback(async () => {
    if (!editSlug) return;

    try {
      const res = await fetch(`/api/posts/${editSlug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      alert("삭제 완료! 잠시 후 사이트에 반영됩니다.");
      router.push("/");
    } catch (err) {
      alert(
        "삭제 실패: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  }, [editSlug, router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
  };

  // Checking auth state
  if (checkingAuth) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  // Auth screen - Login with GitHub
  if (!authenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <h1 className="text-2xl font-bold text-foreground">Write</h1>
        <p className="mt-2 text-sm text-muted">
          글을 작성하려면 GitHub 로그인이 필요합니다.
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-500">
            {error === "unauthorized"
              ? "권한이 없는 계정입니다."
              : "인증에 실패했습니다. 다시 시도해주세요."}
          </p>
        )}
        <div className="mt-6">
          <a
            href="/api/auth/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#24292f] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#32383f]"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Login with GitHub
          </a>
        </div>
      </div>
    );
  }

  // Loading edit data
  if (editSlug && loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
        <p className="mt-4 text-muted">글을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="eyebrow">EDITOR</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">
            {editSlug ? "글 다듬기" : "새 글 쓰기"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {editSlug && (
            <button
              onClick={() => router.push(`/posts/${editSlug}`)}
              className="rounded-xl border border-card-border px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              돌아가기
            </button>
          )}
          <button
            onClick={handleLogout}
            className="rounded-xl border border-card-border px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
      <MarkdownEditor
        onPublish={handlePublish}
        onDelete={editSlug ? handleDelete : undefined}
        initialData={initialData}
        isEditMode={!!editSlug}
      />
    </div>
  );
}
