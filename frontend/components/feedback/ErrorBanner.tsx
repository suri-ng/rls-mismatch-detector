import Link from "next/link";

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-control bg-divider px-4 py-3 text-sm text-ink">
      <div className="flex items-start gap-2">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
        <span>{message}</span>
      </div>
      <Link
        href="/"
        className="shrink-0 whitespace-nowrap text-muted underline-offset-2 transition-colors hover:text-ink hover:underline"
      >
        Try again
      </Link>
    </div>
  );
}