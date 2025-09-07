import { keyify } from "./text";

export const WILAYA_CENTERS = {
  alger:      { name: "Alger",      lat: 36.7538, lng: 3.0588 },
  oran:       { name: "Oran",       lat: 35.6971, lng: -0.6308 },
  setif:      { name: "Sétif",      lat: 36.1911, lng: 5.4137 },
  constantine:{ name: "Constantine",lat: 36.3650, lng: 6.6147 },
  bejaia:     { name: "Béjaïa",     lat: 36.7525, lng: 5.0673 },
  annaba:     { name: "Annaba",     lat: 36.9023, lng: 7.7560 },
  bechar:     { name: "Béchar",     lat: 31.6167, lng: -2.2167 },
  tlemcen:    { name: "Tlemcen",    lat: 34.8783, lng: -1.3150 },
  blida:      { name: "Blida",      lat: 36.4701, lng: 2.8277 },
  ghardaia:   { name: "Ghardaïa",   lat: 32.4900, lng: 3.6700 },
  skikda:     { name: "Skikda",     lat: 36.8762, lng: 6.9092 },
  mostaganem: { name: "Mostaganem", lat: 35.9311, lng: 0.0903 },
  tiziouzou: { name: "Tizi Ouzou", lat: 36.7118, lng: 4.0459 },
};

export function getWilayaCenter(name = "") {
  const k = keyify(name);
  const c = WILAYA_CENTERS[k];
  return c ? { lat: c.lat, lng: c.lng } : null;
}
export function getWilayaCenterByKey(k = "") {
  const c = WILAYA_CENTERS[k];
  return c ? { lat: c.lat, lng: c.lng } : null;
}
