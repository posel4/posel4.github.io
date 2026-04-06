import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug, getPostsBySeries } from "@/lib/posts";
import { extractToc } from "@/lib/toc";
import MdxContent from "@/components/MdxContent";
import TableOfContents from "@/components/TableOfContents";
import SeriesNav from "@/components/SeriesNav";
import TagBadge from "@/components/TagBadge";

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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex gap-10">
        {/* Main content */}
        <article className="min-w-0 flex-1">
          <header className="mb-8">
            <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {post.categories.map((cat) => (
                <span key={cat} className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs">
                  {cat}
                </span>
              ))}
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

          <MdxContent source={post.content} />
        </article>

        {/* TOC sidebar (desktop only) */}
        {tocItems.length > 0 && (
          <aside className="hidden w-64 shrink-0 xl:block">
            <TableOfContents items={tocItems} />
          </aside>
        )}
      </div>
    </div>
  );
}
