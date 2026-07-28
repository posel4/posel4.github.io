import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { commitFile, getFileSha } from "@/lib/github";
import matter from "gray-matter";

const slugPattern = /^[a-z0-9가-힣][a-z0-9가-힣-]*$/;

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { slug, sha } = body;
  const post = body.post;
  if (!slug || !slugPattern.test(slug) || !post) {
    return NextResponse.json(
      { error: "유효한 slug와 글 정보가 필요합니다." },
      { status: 400 }
    );
  }
  if (
    typeof post.title !== "string" ||
    !post.title.trim() ||
    typeof post.content !== "string" ||
    !post.content.trim()
  ) {
    return NextResponse.json(
      { error: "제목과 본문을 입력해주세요." },
      { status: 400 }
    );
  }

  const filePath = `content/posts/${slug}.mdx`;

  // Get existing SHA if not provided
  let fileSha = sha;
  if (!fileSha) {
    fileSha = await getFileSha(session.token, filePath);
  }

  try {
    const date =
      typeof post.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(post.date)
        ? post.date
        : new Date().toISOString().split("T")[0];
    const metadata: Record<string, unknown> = {
      title: post.title.trim().slice(0, 160),
      date,
      description:
        typeof post.description === "string"
          ? post.description.trim().slice(0, 300)
          : "",
      categories: stringList(post.categories),
      tags: stringList(post.tags),
    };
    if (typeof post.series === "string" && post.series.trim()) {
      metadata.series = post.series.trim().slice(0, 100);
    }
    const seriesOrder = Number(post.seriesOrder);
    if (Number.isInteger(seriesOrder) && seriesOrder > 0) {
      metadata.seriesOrder = seriesOrder;
    }
    if (typeof post.cover === "string" && post.cover.trim()) {
      try {
        const coverUrl = new URL(post.cover.trim());
        if (["http:", "https:"].includes(coverUrl.protocol)) {
          metadata.cover = coverUrl.toString();
        }
      } catch {
        return NextResponse.json(
          { error: "커버 이미지 URL을 확인해주세요." },
          { status: 400 }
        );
      }
    }
    const fileContent = matter.stringify(`${post.content.trim()}\n`, metadata);
    const result = await commitFile({
      path: filePath,
      content: fileContent,
      message: fileSha ? `Update post: ${post.title}` : `Add post: ${post.title}`,
      token: session.token,
      sha: fileSha,
    });

    // Trigger Vercel deploy hook
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: "POST" }).catch(
        () => {}
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to publish",
      },
      { status: 500 }
    );
  }
}
