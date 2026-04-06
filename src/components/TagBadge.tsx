import Link from "next/link";

interface TagBadgeProps {
  tag: string;
  clickable?: boolean;
}

export default function TagBadge({ tag, clickable = true }: TagBadgeProps) {
  const className =
    "inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors";

  if (clickable) {
    return (
      <Link href={`/tags/${encodeURIComponent(tag)}`} className={className}>
        {tag}
      </Link>
    );
  }

  return <span className={className}>{tag}</span>;
}
