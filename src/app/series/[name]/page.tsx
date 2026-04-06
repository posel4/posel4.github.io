import { notFound } from "next/navigation";
import { getAllSeries, getPostsBySeries } from "@/lib/posts";
import PostList from "@/components/PostList";

interface SeriesDetailProps {
  params: Promise<{ name: string }>;
}

export async function generateStaticParams() {
  return getAllSeries().map((s) => ({ name: s.name }));
}

export async function generateMetadata({ params }: SeriesDetailProps) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  return {
    title: decoded,
    description: `${decoded} 시리즈의 모든 글`,
  };
}

export default async function SeriesDetailPage({ params }: SeriesDetailProps) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const posts = getPostsBySeries(decoded);

  if (posts.length === 0) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground">{decoded}</h1>
      <p className="mt-2 text-muted">{posts.length}개의 포스트</p>
      <div className="mt-8">
        <PostList posts={posts} />
      </div>
    </div>
  );
}
