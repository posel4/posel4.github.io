"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface PostActionsProps {
  slug: string;
}

export default function PostActions({ slug }: PostActionsProps) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setAuthenticated(data.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  const handleDelete = useCallback(async () => {
    if (!confirm("정말 이 글을 삭제하시겠습니까?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      alert("삭제 완료! 잠시 후 사이트에 반영됩니다.");
      router.push("/");
    } catch (err) {
      alert(
        "삭제 실패: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setDeleting(false);
    }
  }, [slug, router]);

  const requireAuth = (action: () => void) => {
    if (authenticated) {
      action();
    } else {
      router.push(`/write`);
    }
  };

  if (!authenticated) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => requireAuth(() => router.push(`/write?slug=${slug}`))}
        className="rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        수정
      </button>
      <button
        onClick={() => requireAuth(handleDelete)}
        disabled={deleting}
        className="rounded-lg border border-red-200 dark:border-red-900 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-700 transition-colors disabled:opacity-50"
      >
        {deleting ? "삭제 중..." : "삭제"}
      </button>
    </div>
  );
}
