import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { href: "/", label: "글" },
  { href: "/series", label: "시리즈" },
  { href: "/about", label: "소개" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground font-display text-sm font-bold text-background transition-transform group-hover:-rotate-6">
            P4
          </span>
          <span>
            <strong className="block font-display text-base leading-none text-foreground">posel4.log</strong>
            <span className="mt-1 block text-[10px] font-bold tracking-[.16em] text-muted">BACKEND NOTES</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-sidebar-hover hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/write"
            className="ml-1 hidden rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5 sm:block"
          >
            글쓰기
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
