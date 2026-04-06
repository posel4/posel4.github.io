import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/series", label: "Series" },
  { href: "/tags", label: "Tags" },
  { href: "/about", label: "About" },
  { href: "/write", label: "Write" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          posel4.dev
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
