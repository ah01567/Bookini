import { useEffect, useState } from "react";
import { buildSrcSet } from "../lib/photos";

export default function HotelCardPhoto({ photo, className = "w-full h-full object-cover" }) {
  const [img, setImg] = useState({ src: photo.src, srcSet: "" });
  useEffect(() => { if (photo?.path) buildSrcSet(photo).then(setImg); }, [photo?.path]);

  return (
    <img
      src={img.src}
      srcSet={img.srcSet}
      sizes="(max-width:640px) 400px, (max-width:1024px) 800px, 1600px"
      alt=""
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}