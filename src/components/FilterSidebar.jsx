import { useEffect, useMemo, useState } from "react";
import { keyify } from "../lib/text";
import MapCard from "../components/MapCard";

const AMENITIES = [
  { key: "kitchen", label: "Cuisine/kitchenette" },
  { key: "private_bathroom", label: "Salle de bain privée" },
  { key: "double_bed", label: "Lit double" },
  { key: "no_prepayment", label: "Sans prépaiement" },
  { key: "wifi", label: "Wi-Fi gratuit" },
  { key: "ac", label: "Climatisation" },
];

const TYPES = [
  { key: "hotel", label: "Hôtels" },
  { key: "guesthouse", label: "Maisons d’hôtes" },
  { key: "apartment", label: "Appartements" },
  { key: "house", label: "Maisons" },
];



 export default function FilterSidebar({ loading, priceBounds, filters, onChange, wilayaKey, points, center }) {
  const [local, setLocal] = useState({
    min: priceBounds.min,
    max: priceBounds.max,
  });

  useEffect(() => {
    setLocal({ min: priceBounds.min, max: priceBounds.max });
  }, [priceBounds.min, priceBounds.max]);

  const hasPrice = useMemo(() => priceBounds.max > 0, [priceBounds]);

  const applyPrice = () => {
    onChange((f) => ({ ...f, minPrice: local.min, maxPrice: local.max }));
  };

  const toggleType = (k, on) => {
    onChange((f) => {
      const s = new Set(f.types);
      on ? s.add(k) : s.delete(k);
      return { ...f, types: s };
    });
  };

  const toggleAmenity = (k, on) => {
    onChange((f) => {
      const s = new Set(f.amenities);
      on ? s.add(k) : s.delete(k);
      return { ...f, amenities: s };
    });
  };

  const clearFilters = () => {
    onChange((f) => ({
      ...f,
      minPrice: null,
      maxPrice: null,
      types: new Set(),
      amenities: new Set(),
    }));
    setLocal({ min: priceBounds.min, max: priceBounds.max });
  };

  const gmapQuery = wilayaKey ? keyify(wilayaKey).replace(/-/g, "+") : "";

  return (
    <div className="space-y-4">
      {/* Map card */}
      <div className="bg-white border rounded-2xl p-3">
        <MapCard center={center} points={points} />
        {/* Optional external map link */}
        {wilayaKey && (
          <a
            href={`https://www.google.com/maps/search/${wilayaKey.replace(/-/g, "+")}`}
            target="_blank" rel="noreferrer"
            className="mt-2 inline-block w-full text-center px-3 py-2 rounded-lg bg-primary text-white text-sm"
          >
            Ouvrir dans Google Maps
          </a>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">Filtres</div>
          <button onClick={clearFilters} className="text-xs text-primary underline">
            Réinitialiser
          </button>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-600 mb-2">
            Budget (par nuit)
          </div>
          {hasPrice ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="w-24 border rounded px-2 py-1"
                  value={local.min}
                  onChange={(e) => setLocal((s) => ({ ...s, min: Number(e.target.value) || 0 }))}
                />
                <span className="text-slate-400">—</span>
                <input
                  type="number"
                  className="w-24 border rounded px-2 py-1"
                  value={local.max}
                  onChange={(e) => setLocal((s) => ({ ...s, max: Number(e.target.value) || 0 }))}
                />
                <button
                  onClick={applyPrice}
                  className="ml-auto px-2 py-1 rounded border text-xs"
                >
                  Appliquer
                </button>
              </div>
              <div className="text-[11px] text-slate-500">
                Min: {priceBounds.min} DZD • Max: {priceBounds.max} DZD
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              Les prix ne sont pas disponibles pour ces résultats.
            </div>
          )}
        </div>

        {/* Popular filters */}
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-600 mb-2">Filtres populaires</div>
          <div className="space-y-2">
            {AMENITIES.map((a) => (
              <label key={a.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-[#c34d54]"
                  checked={filters.amenities.has(a.key)}
                  onChange={(e) => toggleAmenity(a.key, e.target.checked)}
                />
                {a.label}
              </label>
            ))}
          </div>
        </div>

        {/* Property type */}
        <div className="mb-2">
          <div className="text-xs font-semibold text-slate-600 mb-2">Type d’hébergement</div>
          <div className="space-y-2">
            {TYPES.map((t) => (
              <label key={t.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="accent-[#c34d54]"
                  checked={filters.types.has(t.key)}
                  onChange={(e) => toggleType(t.key, e.target.checked)}
                />
                {t.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile helper */}
      <details className="lg:hidden bg-white border rounded-2xl p-3">
        <summary className="cursor-pointer font-medium">Conseil</summary>
        <p className="mt-2 text-sm text-slate-600">
          Sur mobile, faites défiler vers le bas pour voir plus de résultats.
        </p>
      </details>
    </div>
  );
}
