import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const NAV = [
  { to: "/", label: "Séjours", icon: "bed" },
  { to: "/vol-hotel", label: "Hôtel", icon: "bag" },
  { to: "/voitures", label: "Location de voitures", icon: "car" },
  { to: "/attractions", label: "Attractions", icon: "spark" },
  { to: "/taxis", label: "Taxis", icon: "taxi" },
];

function Icon({ name, className = "h-5 w-5" }) {
  switch (name) {
    case "bed":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}><path strokeWidth="1.8" d="M3 18v-6a2 2 0 0 1 2-2h6a4 4 0 0 1 4 4v4"/><path strokeWidth="1.8" d="M3 12h18v6"/></svg>;
    case "plane":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}><path strokeWidth="1.8" d="M10 13L3 11l1-3 9 2 7-7 2 2-7 7 2 9-3 1-2-7-3 3v-4z"/></svg>;
    case "bag":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}><rect x="3" y="7" width="18" height="13" rx="2" strokeWidth="1.8"/><path strokeWidth="1.8" d="M8 7a4 4 0 0 1 8 0"/></svg>;
    case "car":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}><path strokeWidth="1.8" d="M3 13l2-5h14l2 5"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><path strokeWidth="1.8" d="M5 13h14v4H5z"/></svg>;
    case "spark":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}><path strokeWidth="1.8" d="M12 3v4M12 17v4M4.9 6.9l2.8 2.8M16.3 16.3l2.8 2.8M3 12h4M17 12h4M6.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/></svg>;
    case "taxi":
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}><path strokeWidth="1.8" d="M5 11l1.5-4.5h11L19 11M4 15h16v3H4z"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/><path strokeWidth="1.8" d="M9 6h6"/></svg>;
    default:
      return null;
  }
}

/** Brand mark: white briefcase on #c34d54 rounded square */
function BrandLogo() {
  return (
    <span className="grid place-items-center h-8 w-8 md:h-9 md:w-9 bg-primary ">
      <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="currentColor" aria-hidden="true">
        {/* Briefcase body */}
        <rect x="3" y="8" width="18" height="11" rx="2"></rect>
        {/* Handle */}
        <path d="M9 8V7a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v1h-2V7a1 1 0 0 0-1-1h0a1 1 0 0 0-1 1v1H9z"></path>
      </svg>
    </span>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-primary text-white">
      {/* Top bar */}
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + wordmark */}
        <Link to="/" className="inline-flex items-center gap-2 md:gap-3">
          <BrandLogo />
          <span className="font-extrabold text-xl md:text-2xl tracking-tight uppercase">BOOKINI</span>
        </Link>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          <span className="opacity-90">DZD</span>
          <span role="img" aria-label="Algérie">🇩🇿</span>
          <Link to="/aide" className="opacity-90 hover:opacity-100">Aide</Link>
          <Link to="/pro" className="opacity-90 hover:opacity-100">Inscrire votre établissement</Link>
          <Link to="/admin/register" className="btn-light">S’inscrire</Link>
          <Link to="/admin/login" className="btn-light-outline">Se connecter</Link>
        </div>

        {/* Mobile actions */}
        <div className="md:hidden flex items-center gap-3">
          <button className="relative p-2 rounded-full ring-1 ring-white/30" aria-label="Profil">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
              <circle cx="12" cy="8" r="3" />
              <path d="M4 20c1-4 4-6 8-6s7 2 8 6" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />
          </button>
          <button
            aria-label="Menu"
            className="p-2 rounded-lg ring-1 ring-white/30"
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
              <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Nav row */}
      <nav className="border-t border-white/10">
        <ul className="no-scrollbar max-w-6xl mx-auto px-4 h-14 flex items-center gap-2 overflow-x-auto">
          {NAV.map((item, idx) => (
            <li key={item.to} className="flex-shrink-0">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [
                    "inline-flex items-center gap-2 h-9 px-4 rounded-full ring-1 transition",
                    isActive || idx === 0
                      ? "bg-white text-primary ring-white"
                      : "text-white/90 ring-white/30 hover:bg-white/10 hover:ring-white/50"
                  ].join(" ")
                }
              >
                <Icon name={item.icon} />
                <span className="whitespace-nowrap text-sm font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-primary/95">
          <div className="px-4 py-3 flex flex-col gap-2 text-sm">
            <Link to="/pro" className="drawer-link" onClick={() => setOpen(false)}>
              Inscrire votre établissement
            </Link>
            <Link to="/aide" className="drawer-link" onClick={() => setOpen(false)}>
              Aide
            </Link>
            <div className="flex items-center gap-4 mt-1">
              <span className="px-3 py-1.5 rounded-lg bg-white/10">DZD</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10">🇩🇿 FR</span>
            </div>
            <div className="flex gap-2 mt-2">
              <Link to="/admin/register" className="btn-light flex-1" onClick={() => setOpen(false)}>
                S’inscrire
              </Link>
              <Link to="/admin/login" className="btn-light-outline flex-1" onClick={() => setOpen(false)}>
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
