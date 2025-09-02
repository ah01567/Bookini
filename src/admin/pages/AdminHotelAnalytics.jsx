import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useEffect, useState } from "react";

export default function AdminHotelAnalytics() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "properties", id));
      setHotel(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    })();
  }, [id]);

  if (!hotel) return <div className="p-6 text-slate-500">Chargement…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{hotel.title}</h1>
        <span className={"px-2 py-1 rounded-md text-xs " + (hotel.status === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800")}>
          {hotel.status}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { k: "Taux d’occupation", v: "— %" },
          { k: "Réservations (30j)", v: "—" },
          { k: "Revenu (30j)", v: "— DZD" },
          { k: "Note moyenne", v: hotel.ratingAvg ?? "—" },
          { k: "Avis", v: hotel.ratingCount ?? "—" },
          { k: "Prix base", v: (hotel.basePriceDZD ?? 0) + " DZD" }
        ].map((c) => (
          <div key={c.k} className="bg-white rounded-2xl border shadow-sm p-4">
            <div className="text-sm text-slate-500">{c.k}</div>
            <div className="text-2xl font-bold mt-1">{c.v}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="font-semibold mb-4">Dernières activités</h2>
        <p className="text-slate-500 text-sm">Brancher ici réservations récentes, messages, modifications de calendrier…</p>
      </div>
    </div>
  );
}
