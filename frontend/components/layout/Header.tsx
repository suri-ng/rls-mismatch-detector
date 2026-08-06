import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-divider bg-canvas">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-frosty-teal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2 L21 6 V12 C21 17 17 21 12 22 C7 21 3 17 3 12 V6 Z" />
            </svg>
          </span>
          <span className="text-sm font-medium text-ink">RLS Mismatch Detector</span>
        </Link>

        <div className="flex items-center gap-4">
          <button type="button" className="text-sm text-muted transition-colors hover:text-ink">
            Log in
          </button>
          <button
            type="button"
            className="rounded-control border border-border px-4 py-1.5 text-sm text-ink transition-colors hover:border-muted"
          >
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
}