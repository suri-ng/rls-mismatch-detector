import Link from "next/link";

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
      <h2 className="font-display text-lg tracking-tight text-ink">{title}</h2>
      <p className="text-sm text-muted">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-2 text-sm text-frosty-teal underline-offset-2 hover:underline"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}