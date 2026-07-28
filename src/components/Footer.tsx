export default function Footer() {
  return (
    <footer className="mt-auto border-t border-card-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>만들고, 실패하고, 이해한 것을 기록합니다.</p>
        <p>&copy; {new Date().getFullYear()} posel4.log</p>
      </div>
    </footer>
  );
}
