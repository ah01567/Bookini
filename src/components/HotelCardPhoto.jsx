import { useEffect, useState } from "react";
import { buildSrcSet } from "../lib/photos";

export default function HotelCardPhoto({ photo }) {
  const [img, setImg] = useState({ src: photo.src, srcSet: "" });
  useEffect(() => { buildSrcSet(photo).then(setImg); }, [photo?.path]);

  return (
    <img
      src={img.src}
      srcSet={img.srcSet}
      sizes="(max-width:640px) 400px, (max-width:1024px) 800px, 1600px"
      alt=""
      loading="lazy" decoding="async" className="w-full h-40 object-cover rounded-xl"
    />
  );
}