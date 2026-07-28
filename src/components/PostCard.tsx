import Link from "next/link";
import Image from "next/image";
import type { PostMeta } from "@/lib/posts";
import TagBadge from "./TagBadge";

interface PostCardProps {
  post: PostMeta;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="group grid gap-5 py-8 first:pt-0 sm:grid-cols-[1fr_auto] sm:items-start">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </time>
          {post.categories[0] && (
            <>
              <span className="text-card-border">/</span>
              <span className="text-primary">{post.categories[0]}</span>
            </>
          )}
        </div>
        <Link href={`/posts/${post.slug}`} className="block">
          <h3 className="font-display text-2xl font-semibold leading-snug tracking-[-.015em] text-foreground transition-colors group-hover:text-primary sm:text-[1.7rem]">
            {post.title}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted line-clamp-2">
            {post.description}
          </p>
        </Link>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      </div>
      {post.cover && (
        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-card-border sm:w-44">
          <Image
            src={post.cover}
            alt={post.title}
            width={352}
            height={264}
            unoptimized
            className="h-full w-full object-cover grayscale-[15%] transition duration-300 group-hover:scale-105 group-hover:grayscale-0"
          />
        </div>
      )}
    </article>
  );
}
