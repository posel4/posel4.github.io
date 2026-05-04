import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getFileContent, deleteFile } from "@/lib/github";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const filePath = `content/posts/${slug}.mdx`;

  try {
    const file = await getFileContent(session.token, filePath);
    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ content: file.content, sha: file.sha });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const filePath = `content/posts/${slug}.mdx`;

  try {
    const file = await getFileContent(session.token, filePath);
    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteFile(session.token, filePath, file.sha, `Delete post: ${slug}`);

    // Trigger Vercel deploy hook
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: "POST" }).catch(
        () => {}
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to delete",
      },
      { status: 500 }
    );
  }
}
