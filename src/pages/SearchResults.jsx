import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase";
import SearchBar from "../components/SearchBar";
import FilterSidebar from "../components/FilterSidebar";
import ResultCard from "../components/ResultCard";
import { keyify } from "../lib/text";
import { getWilayaCenterByKey } from "../lib/dz-geo";

// try to surface a price if available (single_unit has basePriceDZD)
function approxPrice(p) {
  return Number(p.basePriceDZD || p.hotelMeta?.minPriceDZD || 0) || null;
}
function daysBetween(a, b) {
  if (!a || !b) return 0;
  const d1 = new Date(a), d2 = new Date(b);
  const ms = d2.setHours(0, 0, 0, 0) - d1.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round(ms / 86400000));
}

export default function SearchResults() {
  const [params] = useSearchParams();
  const wilayaKeyParam = useMemo(() => params.get("wilayaKey") || "", [params]);

  // search context (used by ResultCard for the right column caption)
  const searchCtx = useMemo(() => {
    const din = params.get("in") || "";
    const dout = params.get("out") || "";
    return {
      in: din,
      out: dout,
      nights: daysBetween(din, dout),
      adults: Number(params.get("adults") || 2),
      children: Number(params.get("children") || 0),
      rooms: Number(params.get("rooms") || 1),
    };
  }, [params]);

  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters state (controlled by sidebar)
  const [filters, setFilters] = useState({
    minPrice: null,
    maxPrice: null,
    types: new Set(),     // "hotel" | "guesthouse" | "apartment" | "house"
    amenities: new Set(), // "wifi" | "ac" | "kitchen" | ...
  });

  // fetch properties
  useEffect(() => {
    (async () => {
      setLoading(true);
      const q = query(
        collection(db, "properties"),
        where("status", "==", "active"),
        limit(300)
      );
      const snap = await getDocs(q);

      const list = [];
      snap.forEach((d) => {
        const p = { id: d.id, ...d.data() };
        const wKey = p.location?.wilayaKey || keyify(p.location?.wilaya || "");
        if (!wilayaKeyParam || wKey === wilayaKeyParam) {
          list.push({ ...p, _price: approxPrice(p) });
        }
      });

      setAll(list);
      setLoading(false);
    })();
  }, [wilayaKeyParam]);

  // price bounds for slider
  const priceBounds = useMemo(() => {
    const nums = all.map((p) => p._price).filter((n) => n && n > 0);
    if (!nums.length) return { min: 0, max: 0 };
    return { min: Math.min(...nums), max: Math.max(...nums) };
  }, [all]);

  // filtered list
  const items = useMemo(() => {
    return all.filter((p) => {
      // type filter
      if (filters.types.size && !filters.types.has(p.type)) return false;

      // amenities: property-level (single_unit for now)
      if (filters.amenities.size) {
        const propA = new Set(p.amenities || []);
        for (const a of filters.amenities) {
          if (!propA.has(a)) return false;
        }
      }

      // price filter
      if (filters.minPrice != null && p._price != null && p._price < filters.minPrice) return false;
      if (filters.maxPrice != null && p._price != null && p._price > filters.maxPrice) return false;

      return true;
    });
  }, [all, filters]);

  // Map points & center
  const points = useMemo(() => {
    return items
      .map((p) => {
        const c = p.location?.center;
        if (!c?.lat || !c?.lng) return null;
        return {
          id: p.id,
          lat: c.lat,
          lng: c.lng,
          title: p.title,
          wilaya: p.location?.wilaya,
          commune: p.location?.commune,
        };
      })
      .filter(Boolean);
  }, [items]);

  const fallbackCenter = getWilayaCenterByKey(wilayaKeyParam) || { lat: 28.0, lng: 2.6 };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Sticky search bar on top (offset under fixed header) */}
      <div className="sticky top-16 md:top-20 z-40 bg-white/95 backdrop-blur pt-3 pb-4">
        <SearchBar variant="sticky" />
      </div>

      <div className="mt-2 mb-3 text-sm text-slate-600">
        {loading ? "Recherche des hébergements…" : `${items.length} hébergement(s) trouvé(s)`}
        {wilayaKeyParam ? ` • ${wilayaKeyParam.replace(/-/g, " ")}` : ""}
      </div>

      <div className="mt-2 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Map + Filters */}
        <aside className="lg:col-span-4">
          <FilterSidebar
            loading={loading}
            priceBounds={priceBounds}
            filters={filters}
            onChange={setFilters}
            wilayaKey={wilayaKeyParam}
            points={points}
            center={points[0] ? { lat: points[0].lat, lng: points[0].lng } : fallbackCenter}
          />
        </aside>

        {/* RIGHT: results */}
        <main className="lg:col-span-8">
          {loading ? (
            <div className="text-slate-500">Chargement…</div>
          ) : items.length === 0 ? (
            <div className="text-slate-500">Aucun établissement ne correspond à vos filtres.</div>
          ) : (
            <ul className="space-y-4">
              {items.map((p) => (
                <li key={p.id} className="bg-white border rounded-2xl overflow-hidden">
                  <ResultCard property={p} search={searchCtx} />
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
