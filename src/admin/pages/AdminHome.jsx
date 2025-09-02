import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminHome() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const q = query(collection(db, "properties"), orderBy("createdAt", "desc"), limit(100));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Hôtels</h1>
        <Link to="/admin/hotels/new" className="btn-light">Ajouter un hôtel</Link>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
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
                <div className="md:col-span-2">
                  <span className={"px-2 py-1 rounded-md text-xs " + (p.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800")}>
                    {p.status || "draft"}
                  </span>
                </div>
                <div className="md:col-span-2 flex md:justify-end gap-2">
                  <Link to={`/admin/hotels/${p.id}/analytics`} className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm">Analyser</Link>
                  <Link to={`/admin/hotels/${p.id}`} className="px-3 py-1.5 rounded-lg border text-sm">Gérer</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
