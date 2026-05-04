import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { commitFile, getFileSha } from "@/lib/github";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, content, message, sha } = await request.json();
  if (!slug || !content) {
    return NextResponse.json(
      { error: "slug and content are required" },
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
    const result = await commitFile({
      path: filePath,
      content,
      message: message || (fileSha ? `Update post: ${slug}` : `Add post: ${slug}`),
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
