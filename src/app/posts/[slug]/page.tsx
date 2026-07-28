import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug, getPostsBySeries } from "@/lib/posts";
import { extractToc } from "@/lib/toc";
import MdxContent from "@/components/MdxContent";
import TableOfContents from "@/components/TableOfContents";
import SeriesNav from "@/components/SeriesNav";
import TagBadge from "@/components/TagBadge";
import PostActions from "@/components/PostActions";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    return {
      title: post.title,
      description: post.description,
    };
  } catch {
    return { title: "Post Not Found" };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const tocItems = extractToc(post.content);
  const seriesPosts = post.series ? getPostsBySeries(post.series) : [];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
      <div className="flex gap-14">
        {/* Main content */}
        <article className="min-w-0 flex-1">
          <header className="mb-12 border-b border-card-border pb-10">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {post.categories.map((cat) => (
                <span key={cat} className="eyebrow">
                  {cat.toUpperCase()}
                </span>
              ))}
            </div>
            <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.2] tracking-[-.03em] text-foreground md:text-6xl">
              {post.title}
            </h1>
            {post.description && (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
                {post.description}
              </p>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-muted">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span>·</span>
              <span>posel4</span>
              <PostActions slug={slug} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          </header>

          {post.series && seriesPosts.length > 0 && (
            <div className="mb-8">
              <SeriesNav
                series={post.series}
                posts={seriesPosts}
                currentSlug={slug}
              />
            </div>
          )}

          <div className="mx-auto max-w-3xl">
            <MdxContent source={post.content} />
          </div>
        </article>

        {/* TOC sidebar (desktop only) */}
        {tocItems.length > 0 && (
          <aside className="hidden w-60 shrink-0 xl:block">
            <TableOfContents items={tocItems} />
          </aside>
        )}
      </div>
    </div>
  );
}
