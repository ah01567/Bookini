import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "block px-3 py-2 rounded-lg " + (isActive ? "bg-white text-primary" : "text-white/90 hover:bg-white/10")
      }
    >
      {children}
    </NavLink>
  );
}

export default function HostLayout() {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <header className="h-14 bg-primary text-white">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <Link to="/host" className="font-extrabold tracking-wide flex items-center gap-2">
            <span className="grid place-items-center h-8 w-8 rounded-xl bg-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="currentColor">
                <rect x="3" y="8" width="18" height="11" rx="2"></rect>
                <path d="M9 8V7a3 3 0 0 1 6 0v1h-2V7a1 1 0 0 0-2 0v1z"></path>
              </svg>
            </span>
            <span className="uppercase">BOOKINI • Hôte</span>
          </Link>
          <button onClick={signOut} className="btn-light-outline">Déconnexion</button>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-[220px,1fr]">
        <aside className="bg-primary rounded-2xl p-3 md:sticky md:top-4 h-max">
          <nav className="space-y-1 text-sm">
            <NavItem to="/host">Mes hôtels</NavItem>
            <NavItem to="/host/hotels/new">Ajouter un hôtel</NavItem>
          </nav>
        </aside>

        <main className="min-h-[60vh]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
