"use client";

import { useState, useCallback } from "react";
import MarkdownEditor from "@/components/MarkdownEditor";

export default function WritePage() {
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  // Check sessionStorage on mount
  useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("github_pat");
      if (saved) {
        setToken(saved);
        setAuthenticated(true);
      }
    }
  });

  const handleAuth = useCallback(() => {
    if (!token.trim()) {
      alert("GitHub PAT를 입력해주세요.");
      return;
    }
    sessionStorage.setItem("github_pat", token);
    setAuthenticated(true);
  }, [token]);

  const handlePublish = useCallback(
    async (data: {
      title: string;
      content: string;
      tags: string;
      series: string;
      description: string;
    }) => {
      const pat = sessionStorage.getItem("github_pat");
      if (!pat) {
        alert("인증이 필요합니다.");
        setAuthenticated(false);
        return;
      }

      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      const date = new Date().toISOString().split("T")[0];
      const tagList = data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const frontMatter = [
        "---",
        `title: "${data.title}"`,
        `date: "${date}"`,
        `description: "${data.description || data.content.slice(0, 150)}"`,
        `categories: []`,
        `tags: [${tagList.map((t) => `"${t}"`).join(", ")}]`,
        data.series ? `series: "${data.series}"` : null,
        "---",
      ]
        .filter(Boolean)
        .join("\n");

      const fileContent = `${frontMatter}\n\n${data.content}\n`;
      const filePath = `content/posts/${slug}.mdx`;

      const { Octokit } = await import("octokit");
      const octokit = new Octokit({ auth: pat });

      // Check if file exists (for updates)
      let sha: string | undefined;
      try {
        const existing = await octokit.rest.repos.getContent({
          owner: "posel4",
          repo: "posel4.github.io",
          path: filePath,
          ref: "main",
        });
        if (!Array.isArray(existing.data) && existing.data.type === "file") {
          sha = existing.data.sha;
        }
      } catch {
        // File doesn't exist — creating new
      }

      await octokit.rest.repos.createOrUpdateFileContents({
        owner: "posel4",
        repo: "posel4.github.io",
        path: filePath,
        message: sha ? `Update post: ${data.title}` : `Add post: ${data.title}`,
        content: btoa(unescape(encodeURIComponent(fileContent))),
        sha,
        branch: "main",
      });

      alert("발행 완료! GitHub Actions가 자동으로 배포합니다.");
    },
    []
  );

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <h1 className="text-2xl font-bold text-foreground">Write</h1>
        <p className="mt-2 text-sm text-muted">
          글을 작성하려면 GitHub Personal Access Token이 필요합니다.
        </p>
        <div className="mt-6 space-y-3">
          <input
            type="password"
            placeholder="GitHub PAT (ghp_...)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            className="w-full rounded-lg border border-card-border bg-card-bg px-4 py-3 text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
          />
          <button
            onClick={handleAuth}
            className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            인증하기
          </button>
          <p className="text-xs text-muted">
            PAT는 탭을 닫으면 자동으로 삭제됩니다 (sessionStorage).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Write</h1>
      <MarkdownEditor onPublish={handlePublish} />
    </div>
  );
}
