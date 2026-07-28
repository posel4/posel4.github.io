import type { PostMeta } from "@/lib/posts";
import PostCard from "./PostCard";

interface PostListProps {
  posts: PostMeta[];
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="py-20 text-center text-muted">
        <p className="text-lg">아직 포스트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-card-border">
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
