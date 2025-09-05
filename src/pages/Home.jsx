import { useEffect, useState } from "react";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase";
import SearchBar from "../components/SearchBar";
import WilayaCard from "../components/WilayaCard";
import { keyify } from "../lib/text";

export default function Home() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // MVP: fetch up to 400 active properties and group by wilaya
      const q = query(collection(db, "properties"), where("status", "==", "active"), limit(400));
      const snap = await getDocs(q);

      const map = new Map(); // wilayaKey -> { name, count, photo }
      snap.forEach(d => {
        const p = d.data();
        const name = p?.location?.wilaya || "Autre";
        const key = p?.location?.wilayaKey || keyify(name);
        const photo = p?.photos?.[0] || null;

        const cur = map.get(key) || { name, key, count: 0, photo: null };
        cur.count += 1;
        if (!cur.photo && photo) cur.photo = photo; // first image as cover
        map.set(key, cur);
      });

      // sort by count desc and keep top 10
      const arr = Array.from(map.values()).sort((a,b)=>b.count-a.count).slice(0,10);
      setGroups(arr);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      {/* Hero section with search */}
      <div className="bg-primary text-white pt-14 pb-24">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-3">Trouvez votre prochain séjour</h1>
          <p className="opacity-90">Cherchez les meilleurs prix sur les hôtels, maisons, et plus…</p>
        </div>
      </div>

      <div className="relative z-10 px-4">
        <SearchBar />
      </div>

      {/* Wilaya grid */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-4">Destinations populaires en Algérie</h2>

        {loading ? (
          <div className="text-slate-500">Chargement…</div>
        ) : groups.length === 0 ? (
          <div className="text-slate-500">Aucun établissement actif pour l’instant.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(g => (
              <WilayaCard
                key={g.key}
                wilaya={{ name: g.name, key: g.key }}
                count={g.count}
                samplePhoto={g.photo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
