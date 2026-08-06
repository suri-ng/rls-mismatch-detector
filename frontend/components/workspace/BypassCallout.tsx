export function BypassCallout() {
  return (
    <div className="flex items-start gap-2 rounded-control bg-divider px-3 py-2 text-xs text-ink">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-600" />
      <span>
        This request uses a privileged credential that skips row-level security
        entirely — the enforcement side below never actually applies here.
      </span>
    </div>
  );
}