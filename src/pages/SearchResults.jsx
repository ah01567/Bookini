import { useMemo, useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, getDocs, orderBy, query, where, limit } from "firebase/firestore";
import { db } from "../firebase";
import { keyify } from "../lib/text";
import HotelCardPhoto from "../components/HotelCardPhoto";

export default function SearchResults() {
  const [params] = useSearchParams();
  const wilayaKey = useMemo(() => params.get("wilayaKey") || "", [params]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Prefer querying by normalized field; fallback to naive client filter
      const q = query(
        collection(db, "properties"),
        where("status", "==", "active"),
        limit(200)
      );
      const snap = await getDocs(q);
      const list = [];
      snap.forEach(d => {
        const p = { id: d.id, ...d.data() };
        const key = p.location?.wilayaKey || keyify(p.location?.wilaya || "");
        if (!wilayaKey || key === wilayaKey) list.push(p);
      });
      setItems(list);
      setLoading(false);
    })();
  }, [wilayaKey]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        Résultats {wilayaKey ? `— ${wilayaKey.replace(/-/g, " ")}` : ""}
      </h1>

      {loading ? (
        <div className="text-slate-500">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="text-slate-500">Aucun établissement trouvé.</div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-6">
          {items.map((p) => (
            <li key={p.id} className="rounded-2xl border overflow-hidden bg-white">
              {p.photos?.[0] && <HotelCardPhoto photo={p.photos[0]} />}
              <div className="p-4">
                <div className="font-semibold text-lg">{p.title}</div>
                <div className="text-sm text-slate-500">
                  {p.location?.wilaya} • {p.location?.commune}
                </div>
                <div className="mt-3">
                  <Link to={`/hotels/${p.id}`} className="text-primary underline">
                    Voir les détails
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
