export function RlsDisabledCallout() {
  return (
    <div className="flex items-start gap-2 rounded-control bg-divider px-3 py-2 text-xs text-ink">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
      <span>
        Row-level security is disabled on this table — there is no
        database-level protection here at all, regardless of policies defined.
      </span>
    </div>
  );
}