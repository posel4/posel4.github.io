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
    const pat = localStorage.getItem("github_pat");
    if (pat) setAuthenticated(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!confirm("정말 이 글을 삭제하시겠습니까?")) return;

    const pat = localStorage.getItem("github_pat");
    if (!pat) {
      alert("인증이 필요합니다. Write 페이지에서 먼저 인증해주세요.");
      return;
    }

    setDeleting(true);
    try {
      const { Octokit } = await import("octokit");
      const octokit = new Octokit({ auth: pat });

      const filePath = `content/posts/${slug}.mdx`;

      const existing = await octokit.rest.repos.getContent({
        owner: "posel4",
        repo: "posel4.github.io",
        path: filePath,
        ref: "main",
      });

      if (Array.isArray(existing.data) || existing.data.type !== "file") {
        alert("파일을 찾을 수 없습니다.");
        return;
      }

      await octokit.rest.repos.deleteFile({
        owner: "posel4",
        repo: "posel4.github.io",
        path: filePath,
        message: `Delete post: ${slug}`,
        sha: existing.data.sha,
        branch: "main",
      });

      alert("삭제 완료! GitHub Actions가 자동으로 배포합니다.");
      router.push("/");
    } catch (err) {
      alert("삭제 실패: " + (err instanceof Error ? err.message : "Unknown error"));
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
