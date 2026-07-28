import Link from "next/link";

interface TagBadgeProps {
  tag: string;
  clickable?: boolean;
}

export default function TagBadge({ tag, clickable = true }: TagBadgeProps) {
  const className =
    "inline-block rounded-full border border-card-border px-2.5 py-0.5 text-[11px] font-semibold text-muted transition-colors hover:border-primary/40 hover:text-primary";

  if (clickable) {
    return (
      <Link href={`/tags/${encodeURIComponent(tag)}`} className={className}>
        {tag}
      </Link>
    );
  }

  return <span className={className}>{tag}</span>;
}
