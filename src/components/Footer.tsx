export default function Footer() {
  return (
    <footer className="border-t border-card-border py-8 mt-auto">
      <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} posel4.dev. All rights reserved.</p>
      </div>
    </footer>
  );
}
