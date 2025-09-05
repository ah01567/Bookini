import { useEffect, useState } from "react";
import { buildSrcSet } from "../lib/photos";
import { useNavigate } from "react-router-dom";

export default function WilayaCard({ wilaya, count, samplePhoto }) {
  const nav = useNavigate();
  const [img, setImg] = useState({ src: samplePhoto?.src, srcSet: "" });

  useEffect(() => {
    if (samplePhoto?.path) buildSrcSet(samplePhoto).then(setImg);
  }, [samplePhoto?.path]);

  return (
    <button
      onClick={() => nav(`/recherche?wilayaKey=${wilaya.key}`)}
      className="group text-left rounded-2xl overflow-hidden shadow hover:shadow-lg border bg-white"
    >
      <div className="relative aspect-[16/10]">
        {img?.src && (
          <img
            src={img.src}
            srcSet={img.srcSet}
            sizes="(max-width:640px) 400px, (max-width:1024px) 800px, 1600px"
            alt={wilaya.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 text-white drop-shadow">
          <div className="text-2xl font-extrabold">{wilaya.name}</div>
          <div className="text-sm opacity-90">{count} hébergements</div>
        </div>
      </div>
    </button>
  );
}
