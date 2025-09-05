import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

// ---- icons (inline, no deps)
const EditIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

const STATUS_OPTIONS = [
  { value: "pending_review", label: "En attente" },
  { value: "active",         label: "Actif" },
  { value: "paused",         label: "En pause" },
  { value: "rejected",       label: "Rejeté" },
  { value: "draft",          label: "Brouillon" },
];

const badgeClass = (s) =>
  "px-2 py-1 rounded-md text-xs " +
  (s === "active"
    ? "bg-green-100 text-green-700"
    : s === "rejected"
    ? "bg-rose-100 text-rose-700"
    : s === "paused"
    ? "bg-slate-100 text-slate-700"
    : "bg-amber-100 text-amber-800");

export default function AdminHome() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    (async () => {
      const q = query(collection(db, "properties"), orderBy("createdAt", "desc"), limit(100));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, []);

  const updateStatus = async (id, nextStatus) => {
    const prev = items.find((p) => p.id === id)?.status;
    if (prev === nextStatus) { setEditingId(null); return; }

    // optimistic UI
    setItems((arr) => arr.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)));
    setSavingId(id);
    setEditingId(null);

    try {
      await updateDoc(doc(db, "properties", id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
      alert("Impossible de mettre à jour le statut. Réessayez.");
      setItems((arr) => arr.map((p) => (p.id === id ? { ...p, status: prev } : p)));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Hôtels</h1>
        <Link to="/admin/hotels/new" className="btn-light">Ajouter un hôtel</Link>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-visible">
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-slate-600 border-b">
          <div className="col-span-4">Nom</div>
          <div className="col-span-2">Wilaya</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-500">Chargement…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-slate-500">Aucun hôtel pour l’instant.</div>
        ) : (
          <ul className="divide-y">
            {items.map((p) => (
              <li key={p.id} className="px-4 py-3 grid md:grid-cols-12 gap-2 items-center">
                <div className="md:col-span-4">
                  <div className="font-medium">{p.title || "Sans titre"}</div>
                  <div className="text-xs text-slate-500">{p.location?.address}</div>
                </div>

                <div className="md:col-span-2 text-sm">{p.location?.wilaya || "-"}</div>
                <div className="md:col-span-2 text-sm capitalize">{p.type || "-"}</div>

                {/* Status + Edit popover */}
                <div className="md:col-span-2 relative">
                  <div className="flex items-center gap-2">
                    <span className={badgeClass(p.status || "draft")}>{p.status || "draft"}</span>

                    <button
                      type="button"
                      className="p-1 rounded hover:bg-slate-100"
                      aria-label="Modifier le statut"
                      onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                    >
                      <EditIcon className="w-4 h-4 text-slate-600" />
                    </button>

                    {savingId === p.id && (
                      <span className="inline-block w-4 h-4 border-2 border-slate-300 border-l-transparent rounded-full animate-spin" />
                    )}
                  </div>

                  {editingId === p.id && (
                    <div className="absolute z-10 mt-2 w-48 bg-white border rounded-lg shadow-lg p-2">
                      <div className="text-xs font-semibold px-2 py-1 text-slate-500">
                        Changer le statut
                      </div>
                      <ul className="max-h-56 overflow-auto">
                        {STATUS_OPTIONS.map((opt) => (
                          <li key={opt.value}>
                            <button
                              type="button"
                              onClick={() => updateStatus(p.id, opt.value)}
                              className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 flex items-center justify-between"
                            >
                              <span>{opt.label}</span>
                              {(p.status || "draft") === opt.value && (
                                <span className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="mt-1 w-full text-xs text-slate-500 hover:text-slate-700 py-1"
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 flex md:justify-end gap-2">
                  <Link to={`/admin/hotels/${p.id}/analytics`} className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm">
                    Analyser
                  </Link>
                  <Link to={`/admin/hotels/${p.id}`} className="px-3 py-1.5 rounded-lg border text-sm">
                    Gérer
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
