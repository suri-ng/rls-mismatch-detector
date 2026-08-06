import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-divider bg-canvas">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-12 py-7">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-frosty-teal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2 L21 6 V12 C21 17 17 21 12 22 C7 21 3 17 3 12 V6 Z" />
            </svg>
          </span>
          <span className="text-base font-medium text-ink">RLS Mismatch Detector</span>
        </Link>

        <div className="flex items-center gap-5">
          <button type="button" className="text-base text-muted transition-colors hover:text-ink">
            Log in
          </button>
          <button
            type="button"
            className="rounded-control border border-border px-5 py-2.5 text-base text-ink transition-colors hover:border-muted"
          >
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
}