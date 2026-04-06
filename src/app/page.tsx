import { getAllPosts } from "@/lib/posts";
import PostList from "@/components/PostList";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-10">
        <h1 className="text-3xl font-bold text-foreground">
          Latest Posts
        </h1>
        <p className="mt-2 text-muted">
          개발하면서 배운 것들을 기록합니다.
        </p>
      </section>
      <PostList posts={posts} />
    </div>
  );
}
