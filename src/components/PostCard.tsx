import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import TagBadge from "./TagBadge";

interface PostCardProps {
  post: PostMeta;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-card-border bg-card-bg transition-all hover:shadow-lg hover:-translate-y-1">
      {post.cover && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.cover}
            alt={post.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/posts/${post.slug}`} className="group/title">
          <h2 className="text-lg font-bold leading-snug text-foreground group-hover/title:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-3">
          {post.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {post.series && (
            <Link
              href={`/series/${encodeURIComponent(post.series)}`}
              className="text-primary hover:underline"
            >
              {post.series}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
