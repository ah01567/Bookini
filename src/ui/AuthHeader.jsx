import { Link } from "react-router-dom";

function BrandMark() {
  // white tile with primary briefcase (stands out on primary bar)
  return (
    <span className="grid place-items-center h-8 w-8 rounded-xl bg-white">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="currentColor" aria-hidden="true">
        <rect x="3" y="8" width="18" height="11" rx="2"></rect>
        <path d="M9 8V7a3 3 0 0 1 3-3a3 3 0 0 1 3 3v1h-2V7a1 1 0 0 0-1-1a1 1 0 0 0-1 1v1z"></path>
      </svg>
    </span>
  );
}

export default function AuthHeader() {
  return (
    <header className="h-14 bg-primary text-white">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        {/* Brand (left) */}
        <Link to="/" className="flex items-center gap-2">
          <BrandMark />
          <span className="font-extrabold tracking-wide uppercase">BOOKINI</span>
        </Link>

        {/* Right actions (minimal) */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15">
            <span role="img" aria-label="Algérie">🇩🇿</span>
          </button>
          <button className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15">
            <span className="text-sm">FR</span>
          </button>
          <Link to="/aide" className="p-2 rounded-lg hover:bg-white/10" aria-label="Aide">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
              <path strokeWidth="1.8" d="M9.5 9a2.5 2.5 0 115 0c0 2.5-2.5 2-2.5 5" />
              <circle cx="12" cy="17.5" r="1" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
