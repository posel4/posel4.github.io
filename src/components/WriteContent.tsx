"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownEditor";
import type { PostFormData } from "@/components/MarkdownEditor";

const OWNER = "posel4";
const REPO = "posel4.github.io";
const BRANCH = "main";

export default function WriteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editSlug = searchParams.get("slug");

  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<Partial<PostFormData> | undefined>();
  const [fileSha, setFileSha] = useState<string | undefined>();

  // Check sessionStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("github_pat");
    if (saved) {
      setToken(saved);
      setAuthenticated(true);
    }
  }, []);

  // Load existing post for edit mode
  useEffect(() => {
    if (!editSlug || !authenticated) return;

    const loadPost = async () => {
      const pat = localStorage.getItem("github_pat");
      if (!pat) return;

      setLoading(true);
      try {
        const { Octokit } = await import("octokit");
        const octokit = new Octokit({ auth: pat });

        const res = await octokit.rest.repos.getContent({
          owner: OWNER,
          repo: REPO,
          path: `content/posts/${editSlug}.mdx`,
          ref: BRANCH,
        });

        if (Array.isArray(res.data) || res.data.type !== "file") return;

        setFileSha(res.data.sha);

        const raw = decodeURIComponent(
          escape(atob(res.data.content.replace(/\n/g, "")))
        );

        // Parse frontmatter
        const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
        if (!fmMatch) return;

        const frontmatter = fmMatch[1];
        const content = fmMatch[2].trim();

        const getValue = (key: string): string => {
          const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
          if (!match) return "";
          return match[1].replace(/^["']|["']$/g, "").trim();
        };

        const getArrayValue = (key: string): string => {
          const match = frontmatter.match(new RegExp(`^${key}:\\s*\\[(.*)\\]$`, "m"));
          if (!match) return "";
          return match[1]
            .split(",")
            .map((s) => s.trim().replace(/^["']|["']$/g, ""))
            .filter(Boolean)
            .join(", ");
        };

        setInitialData({
          title: getValue("title"),
          description: getValue("description"),
          categories: getArrayValue("categories"),
          tags: getArrayValue("tags"),
          series: getValue("series"),
          seriesOrder: getValue("seriesOrder"),
          cover: getValue("cover"),
          content,
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

  const handleAuth = useCallback(() => {
    if (!token.trim()) {
      alert("GitHub PAT를 입력해주세요.");
      return;
    }
    localStorage.setItem("github_pat", token);
    setAuthenticated(true);
  }, [token]);

  const handlePublish = useCallback(
    async (data: PostFormData) => {
      const pat = localStorage.getItem("github_pat");
      if (!pat) {
        alert("인증이 필요합니다.");
        setAuthenticated(false);
        return;
      }

      const slug = editSlug || data.title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      const date = editSlug
        ? (initialData?.title ? new Date().toISOString().split("T")[0] : new Date().toISOString().split("T")[0])
        : new Date().toISOString().split("T")[0];

      const tagList = data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const catList = data.categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const frontMatter = [
        "---",
        `title: "${data.title}"`,
        `date: "${date}"`,
        `description: "${data.description || data.content.slice(0, 150)}"`,
        `categories: [${catList.map((c) => `"${c}"`).join(", ")}]`,
        `tags: [${tagList.map((t) => `"${t}"`).join(", ")}]`,
        data.series ? `series: "${data.series}"` : null,
        data.seriesOrder ? `seriesOrder: ${data.seriesOrder}` : null,
        data.cover ? `cover: "${data.cover}"` : null,
        "---",
      ]
        .filter(Boolean)
        .join("\n");

      const fileContent = `${frontMatter}\n\n${data.content}\n`;
      const filePath = `content/posts/${slug}.mdx`;

      const { Octokit } = await import("octokit");
      const octokit = new Octokit({ auth: pat });

      // Get SHA for existing file
      let sha = fileSha;
      if (!sha) {
        try {
          const existing = await octokit.rest.repos.getContent({
            owner: OWNER,
            repo: REPO,
            path: filePath,
            ref: BRANCH,
          });
          if (!Array.isArray(existing.data) && existing.data.type === "file") {
            sha = existing.data.sha;
          }
        } catch {
          // New file
        }
      }

      await octokit.rest.repos.createOrUpdateFileContents({
        owner: OWNER,
        repo: REPO,
        path: filePath,
        message: sha
          ? `Update post: ${data.title}`
          : `Add post: ${data.title}`,
        content: btoa(unescape(encodeURIComponent(fileContent))),
        sha,
        branch: BRANCH,
      });

      alert(
        editSlug
          ? "수정 완료! GitHub Actions가 자동으로 배포합니다."
          : "발행 완료! GitHub Actions가 자동으로 배포합니다."
      );

      if (editSlug) {
        router.push(`/posts/${editSlug}`);
      }
    },
    [editSlug, fileSha, initialData, router]
  );

  const handleDelete = useCallback(async () => {
    if (!editSlug) return;

    const pat = localStorage.getItem("github_pat");
    if (!pat) {
      alert("인증이 필요합니다.");
      return;
    }

    const filePath = `content/posts/${editSlug}.mdx`;

    const { Octokit } = await import("octokit");
    const octokit = new Octokit({ auth: pat });

    let sha = fileSha;
    if (!sha) {
      const existing = await octokit.rest.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path: filePath,
        ref: BRANCH,
      });
      if (!Array.isArray(existing.data) && existing.data.type === "file") {
        sha = existing.data.sha;
      }
    }

    if (!sha) {
      alert("파일을 찾을 수 없습니다.");
      return;
    }

    await octokit.rest.repos.deleteFile({
      owner: OWNER,
      repo: REPO,
      path: filePath,
      message: `Delete post: ${editSlug}`,
      sha,
      branch: BRANCH,
    });

    alert("삭제 완료! GitHub Actions가 자동으로 배포합니다.");
    router.push("/");
  }, [editSlug, fileSha, router]);

  // Auth screen
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
            className="w-full rounded-xl border border-card-border bg-card-bg px-4 py-3 text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
          />
          <button
            onClick={handleAuth}
            className="w-full rounded-xl bg-primary px-4 py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            인증하기
          </button>
          <p className="text-xs text-muted">
            PAT는 브라우저에 저장되어 다음에도 자동 로그인됩니다.
          </p>
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
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {editSlug ? "Edit Post" : "Write"}
        </h1>
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
            onClick={() => {
              localStorage.removeItem("github_pat");
              setAuthenticated(false);
              setToken("");
            }}
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
