import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export const THUMB_SIZES = [400, 800, 1600];

// Given a Storage path like: properties/abc/property/file.jpg
export async function getThumbUrl(path, w) {
  const thumbPath = `thumbs/${path}_${w}x${w}.webp`;
  return getDownloadURL(ref(storage, thumbPath));
}

// Build a src + srcSet (fallback to original if thumbs aren’t ready yet)
export async function buildSrcSet(photo) {
  const res = {};
  try { res.src = await getThumbUrl(photo.path, 800); } catch { res.src = photo.src; }
  const parts = [];
  for (const w of THUMB_SIZES) {
    try { parts.push(`${await getThumbUrl(photo.path, w)} ${w}w`); } catch {}
  }
  res.srcSet = parts.join(", ");
  return res;
}
