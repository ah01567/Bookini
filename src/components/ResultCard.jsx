import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../firebase";
import HotelCardPhoto from "../components/HotelCardPhoto";

function fmtDZD(n) {
  try {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      maximumFractionDigits: 0,
    }).format(n || 0);
  } catch {
    return (n || 0).toLocaleString("fr-DZ") + " DZD";
  }
}

function mapUrl(p) {
  const c = p.location?.center;
  if (c?.lat && c?.lng) {
    return `https://www.google.com/maps?q=${c.lat},${c.lng}`;
  }
  const q = encodeURIComponent(
    [p.title, p.location?.address, p.location?.commune, p.location?.wilaya, "Algeria"]
      .filter(Boolean)
      .join(", ")
  );
  return `https://www.google.com/maps/search/${q}`;
}

export default function ResultCard({ property, search }) {
  const p = property;

  // For hotels/guesthouses, fetch roomTypes to get min price + quick summary
  const [roomMeta, setRoomMeta] = useState({ minPrice: null, count: 0 });
  const isHotelKind = ["hotel", "guesthouse"].includes(p.propertyKind || p.type);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isHotelKind) return;
      try {
        const snap = await getDocs(
          query(collection(db, "properties", p.id, "roomTypes"), limit(20))
        );
        let min = null;
        let count = 0;
        snap.forEach((d) => {
          const r = d.data();
          count++;
          const price = Number(r.basePriceDZD || 0);
          if (!min || (price && price < min)) min = price;
        });
        if (mounted) setRoomMeta({ minPrice: min, count });
      } catch {
        if (mounted) setRoomMeta({ minPrice: null, count: 0 });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [p.id, isHotelKind]);

  // Consolidated price (property-level for single_unit OR min room price)
  const listPrice =
    isHotelKind ? roomMeta.minPrice ?? null : Number(p.basePriceDZD || 0) || null;

  // Search context (nights/adults) for the small caption on the right
  const nights = useMemo(() => Number(search?.nights || 0), [search?.nights]);
  const adults = useMemo(() => Number(search?.adults || 2), [search?.adults]);

  // Quick bullets
  const bullets = useMemo(() => {
    const arr = [];
    if (p.propertyKind === "single_unit" && p.capacity) {
      const c = p.capacity || {};
      if (c.bedrooms != null) arr.push(`${c.bedrooms} chambre(s)`);
      if (c.beds != null) arr.push(`${c.beds} lit(s)`);
      if (c.bathrooms != null) arr.push(`${c.bathrooms} salle(s) de bain`);
    } else if (isHotelKind && roomMeta.count) {
      arr.push(`${roomMeta.count} type(s) de chambre`);
    }
    if ((p.amenities || []).includes("no_prepayment")) {
      arr.push("Sans prépaiement");
    }
    return arr;
  }, [p.propertyKind, p.capacity, p.amenities, isHotelKind, roomMeta.count]);

  return (
    <div className="p-3 flex flex-col sm:flex-row gap-4">
      {/* Left: square thumbnail */}
      <div className="w-full sm:w-44 sm:h-44 rounded-xl overflow-hidden border flex-shrink-0">
        {p.photos?.[0] ? (
          <HotelCardPhoto photo={p.photos[0]} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-100" />
        )}
      </div>

      {/* Middle: details */}
      <div className="flex-1 flex flex-col">
        {/* Title + rating */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link to={`/hotels/${p.id}`} className="text-lg font-semibold hover:underline">
              {p.title || "Sans titre"}
            </Link>
            <div className="text-[13px] text-slate-600">
              <Link to={`/recherche?wilayaKey=${p.location?.wilayaKey}`} className="underline mr-1">
                {p.location?.wilaya}
              </Link>
              ·{" "}
              <a href={mapUrl(p)} target="_blank" rel="noreferrer" className="underline mx-1">
                Voir sur la carte
              </a>
              {p.location?.commune ? <span>· {p.location.commune}</span> : null}
            </div>
          </div>

          {p.ratingCount > 0 && (
            <div className="flex items-start gap-2">
              <div className="text-right leading-tight">
                <div className="text-[13px] text-slate-600">
                  {p.ratingAvg >= 8 ? "Excellent" : p.ratingAvg >= 7 ? "Bien" : "Correct"}
                </div>
                <div className="text-[11px] text-slate-500">{p.ratingCount} avis</div>
              </div>
              <span className="px-2 py-1 rounded-md bg-slate-800 text-white text-xs h-min">
                {Number(p.ratingAvg || 0).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Subtitle */}
        <div className="mt-1 text-[13px] text-slate-700 capitalize">
          {p.propertyKind === "single_unit"
            ? (p.type || "Logement")
            : (p.type === "guesthouse" ? "Maison d’hôtes" : "Hôtel")}
        </div>

        {/* Bullets */}
        {bullets.length > 0 && (
          <ul className="mt-2 text-[13px] text-slate-700 space-y-1">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-[5px] inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right: price & CTA */}
      <div className="sm:w-56 flex flex-col items-end justify-between gap-2">
        <div className="text-right">
          {nights > 0 && (
            <div className="text-xs text-slate-500 mb-0.5">
              {nights} nuit{nights > 1 ? "s" : ""} · {adults} adulte{adults > 1 ? "s" : ""}
            </div>
          )}
          <div className="text-lg font-bold">
            {listPrice ? fmtDZD(listPrice) : "Prix à confirmer"}
          </div>
          <div className="text-[11px] text-slate-500">Taxes et frais inclus</div>
        </div>

        <Link
          to={`/hotels/${p.id}`}
          className="px-3 py-2 rounded-lg bg-primary text-white text-sm"
        >
          Voir la disponibilité
        </Link>
      </div>
    </div>
  );
}
