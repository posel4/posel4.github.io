import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import PostList from "@/components/PostList";

interface TagDetailProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  return getAllTags().map((t) => ({ tag: t.name }));
}

export async function generateMetadata({ params }: TagDetailProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded}`,
    description: `${decoded} 태그의 모든 글`,
  };
}

export default async function TagDetailPage({ params }: TagDetailProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = getPostsByTag(decoded);

  if (posts.length === 0) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">
        <span className="text-primary">#</span>{decoded}
      </h1>
      <p className="mt-2 text-muted">{posts.length}개의 포스트</p>
      <div className="mt-8">
        <PostList posts={posts} />
      </div>
    </div>
  );
}
