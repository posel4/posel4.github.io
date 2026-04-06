import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

interface SeriesNavProps {
  series: string;
  posts: PostMeta[];
  currentSlug: string;
}

export default function SeriesNav({ series, posts, currentSlug }: SeriesNavProps) {
  const currentIndex = posts.findIndex((p) => p.slug === currentSlug);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-5">
      <Link
        href={`/series/${encodeURIComponent(series)}`}
        className="text-sm font-semibold text-primary hover:underline"
      >
        {series}
      </Link>
      <div className="mt-3 space-y-1">
        {posts.map((post, index) => (
          <div key={post.slug} className="flex items-center gap-2 text-sm">
            <span className="w-5 text-center text-xs text-muted">
              {index + 1}
            </span>
            {post.slug === currentSlug ? (
              <span className="font-medium text-primary">{post.title}</span>
            ) : (
              <Link
                href={`/posts/${post.slug}`}
                className="text-muted hover:text-foreground transition-colors"
              >
                {post.title}
              </Link>
            )}
          </div>
        ))}
      </div>
      {(prevPost || nextPost) && (
        <div className="mt-4 flex justify-between gap-4 border-t border-card-border pt-4">
          {prevPost ? (
            <Link
              href={`/posts/${prevPost.slug}`}
              className="text-sm text-muted hover:text-primary transition-colors"
            >
              &larr; {prevPost.title}
            </Link>
          ) : (
            <div />
          )}
          {nextPost ? (
            <Link
              href={`/posts/${nextPost.slug}`}
              className="text-sm text-right text-muted hover:text-primary transition-colors"
            >
              {nextPost.title} &rarr;
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  );
}
