import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

export default function HostHome() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // small helpers
  const toMillis = (v) =>
    typeof v?.toMillis === "function" ? v.toMillis() : Number(new Date(v || 0));
  const sortByCreatedDesc = (arr) =>
    arr.sort((a, b) => (toMillis(b.createdAt) || 0) - (toMillis(a.createdAt) || 0));
  const chunk = (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );

  useEffect(() => {
    if (!user) return;

    (async () => {
      setLoading(true);
      setError("");

      const out = new Map();
      const baseCol = collection(db, "properties");

      // Try a query with orderBy; if index missing, retry without orderBy and sort in JS.
      const runWithFallback = async (filters) => {
        try {
          const q1 = query(baseCol, ...filters, orderBy("createdAt", "desc"), limit(100));
          const s1 = await getDocs(q1);
          s1.forEach((d) => out.set(d.id, { id: d.id, ...d.data() }));
        } catch (e) {
          if (e?.code === "failed-precondition") {
            // Missing composite index — fetch without orderBy
            const q2 = query(baseCol, ...filters, limit(100));
            const s2 = await getDocs(q2);
            s2.forEach((d) => out.set(d.id, { id: d.id, ...d.data() }));
            setError(
              "Index Firestore manquant. Ajoutez l’index (hostId ↑, createdAt ↓) et/ou (orgId ↑, createdAt ↓)."
            );
          } else {
            throw e;
          }
        }
      };

      try {
        // A) Properties owned directly by the host
        await runWithFallback([where("hostId", "==", user.uid)]);

        // B) Properties attached to orgs the user belongs to (Firestores 'in' max 10)
        const orgIds = Array.isArray(profile?.orgIds) ? profile.orgIds : [];
        for (const group of chunk(orgIds, 10)) {
          if (group.length) {
            await runWithFallback([where("orgId", "in", group)]);
          }
        }

        setItems(sortByCreatedDesc(Array.from(out.values())));
      } catch (e) {
        console.error("HostHome fetch failed:", e);
        setError(e?.message || "Erreur lors du chargement de vos établissements.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, profile?.orgIds]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Mes hôtels</h1>
        <Link to="/host/hotels/new" className="btn-light">
          Ajouter un hôtel
        </Link>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-slate-600 border-b">
          <div className="col-span-5">Nom</div>
          <div className="col-span-3">Localisation</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-500">Chargement…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            Vous n’avez pas encore d’établissement.
          </div>
        ) : (
          <ul className="divide-y">
            {items.map((p) => (
              <li
                key={p.id}
                className="px-4 py-3 grid md:grid-cols-12 gap-2 items-center"
              >
                <div className="md:col-span-5">
                  <div className="font-medium">{p.title || "Sans titre"}</div>
                  <div className="text-xs text-slate-500">{p.location?.address}</div>
                </div>
                <div className="md:col-span-3 text-sm">
                  {p.location?.wilaya || "-"} • {p.location?.commune || "-"}
                </div>
                <div className="md:col-span-2">
                  <span
                    className={
                      "px-2 py-1 rounded-md text-xs " +
                      (p.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-800")
                    }
                  >
                    {p.status || "draft"}
                  </span>
                </div>
                <div className="md:col-span-2 flex md:justify-end gap-2">
                  <Link
                    to={`/host/hotels/${p.id}/analytics`}
                    className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm"
                  >
                    Analyser
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
