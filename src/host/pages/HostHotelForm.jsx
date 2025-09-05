import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  addDoc, collection, serverTimestamp, updateDoc, doc
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import ImagePicker from "../../ui/ImagePicker";

// Small util: upload a batch of files and return [{src, path, contentType, size}]
async function uploadFiles(files, prefix, onEachProgress) {
  const out = [];
  for (const file of files || []) {
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
    const r = ref(storage, `${prefix}/${name}`);
    const task = uploadBytesResumable(r, file, {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    });
    await new Promise((res, rej) => {
      task.on("state_changed", (snap) => onEachProgress?.(file, snap), rej, res);
    });
    const src = await getDownloadURL(task.snapshot.ref);
    out.push({ src, path: task.snapshot.ref.fullPath, contentType: file.type, size: file.size });
  }
  return out;
}

const AMENITIES = ["wifi","ac","heating","parking","kitchen","tv","elevator","washer","dryer","breakfast","pool","spa"];

export default function HostHotelForm() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    type: "hotel", // hotel | guesthouse | apartment | house
    wilaya: "", commune: "", address: "",
    basePriceDZD: 0, // for single_unit
    description: "",
    amenities: [], // for single_unit
    capacity: { guests: 2, bedrooms: 1, beds: 1, bathrooms: 1 }, // for single_unit
    starRating: 3, // for hotel/guesthouse
    propertyFiles: [], // property-level images
    roomTypes: [
      // used when hotel/guesthouse
      {
        name: "",
        totalUnits: 0,
        basePriceDZD: 0,
        capacity: { guests: 2, beds: 1, bathrooms: 1 },
        amenities: [],
        files: [], // images specific to this room type
      },
    ],
  });

  const isHotelKind = ["hotel", "guesthouse"].includes(form.type);
  const propertyKind = isHotelKind ? "hotel" : "single_unit";
  const setVal = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const setCapacity = (k, v) => setForm((s) => ({ ...s, capacity: { ...s.capacity, [k]: v } }));
  const toggleAmenity = (key, on) =>
    setForm((s) => {
      const set = new Set(s.amenities);
      on ? set.add(key) : set.delete(key);
      return { ...s, amenities: Array.from(set) };
    });

  const addRoomType = () =>
    setVal("roomTypes", [
      ...form.roomTypes,
      {
        name: "",
        totalUnits: 0,
        basePriceDZD: 0,
        capacity: { guests: 2, beds: 1, bathrooms: 1 },
        amenities: [],
        files: [],
      },
    ]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);

      // 1) Create property doc first (needs id for storage paths)
      const data = {
        hostId: user.uid,
        orgId: null,
        title: form.title.trim(),
        type: form.type,
        propertyKind,
        status: "pending_review",
        location: { country: "DZ", wilaya: form.wilaya || "", commune: form.commune || "", address: form.address || "" },
        description: form.description || "",
        amenities: isHotelKind ? [] : form.amenities,
        basePriceDZD: isHotelKind ? 0 : Number(form.basePriceDZD) || 0,
        capacity: isHotelKind ? null : {
          guests: Number(form.capacity.guests)||1,
          bedrooms: Number(form.capacity.bedrooms)||0,
          beds: Number(form.capacity.beds)||0,
          bathrooms: Number(form.capacity.bathrooms)||0
        },
        hotelMeta: isHotelKind ? { starRating: Number(form.starRating)||0 } : null,
        photos: [],
        ratingAvg: 0, ratingCount: 0,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      };
      const propRef = await addDoc(collection(db, "properties"), data);

      // 2) Upload property-level photos (optional)
      let propertyPhotos = [];
      if (form.propertyFiles?.length) {
        propertyPhotos = await uploadFiles(form.propertyFiles, `properties/${propRef.id}/property`);
        await updateDoc(doc(db, "properties", propRef.id), {
          photos: propertyPhotos, updatedAt: serverTimestamp(),
        });
      }

      // 3) Room types (+ their photos) if hotel/guesthouse
      if (isHotelKind) {
        const valid = form.roomTypes.filter((rt) => rt.name && rt.totalUnits > 0);
        for (const rt of valid) {
          const rtRef = await addDoc(collection(db, "properties", propRef.id, "roomTypes"), {
            name: rt.name,
            totalUnits: Number(rt.totalUnits) || 0,
            basePriceDZD: Number(rt.basePriceDZD) || 0,
            capacity: {
              guests: Number(rt.capacity.guests) || 1,
              beds: Number(rt.capacity.beds) || 0,
              bathrooms: Number(rt.capacity.bathrooms) || 0,
            },
            amenities: rt.amenities || [],
            photos: [],
            createdAt: serverTimestamp(),
          });

          if (rt.files?.length) {
            const photos = await uploadFiles(rt.files, `properties/${propRef.id}/roomTypes/${rtRef.id}`);
            await updateDoc(rtRef, { photos });
          }
        }
      }

      // 4) Go to analytics
      nav(`/host/hotels/${propRef.id}/analytics`);
    } catch (err) {
      alert(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <h1 className="text-xl font-bold mb-4">Ajouter un hôtel</h1>

      <form onSubmit={submit} className="grid gap-6">
        <div>
          <label className="block text-sm font-medium">Nom de l’hôtel</label>
          <input className="mt-1 w-full border rounded-lg p-2"
            value={form.title} onChange={(e)=>setVal("title", e.target.value)} required />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select className="mt-1 w-full border rounded-lg p-2"
              value={form.type} onChange={(e)=>setVal("type", e.target.value)}>
              <option value="hotel">Hôtel</option>
              <option value="guesthouse">Maison d’hôtes</option>
              <option value="apartment">Appartement</option>
              <option value="house">Maison</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Wilaya</label>
            <input className="mt-1 w-full border rounded-lg p-2"
              value={form.wilaya} onChange={(e)=>setVal("wilaya", e.target.value)} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Commune</label>
            <input className="mt-1 w-full border rounded-lg p-2"
              value={form.commune} onChange={(e)=>setVal("commune", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Adresse</label>
            <input className="mt-1 w-full border rounded-lg p-2"
              value={form.address} onChange={(e)=>setVal("address", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea rows={3} className="mt-1 w-full border rounded-lg p-2"
            value={form.description} onChange={(e)=>setVal("description", e.target.value)} />
        </div>

        {/* Property photos */}
        <ImagePicker
          label="Photos de l’établissement"
          files={form.propertyFiles}
          onChange={(files)=>setVal("propertyFiles", files)}
        />

        {isHotelKind ? (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium">Classement (étoiles)</label>
                <input type="number" min={0} max={5} className="mt-1 w-full border rounded-lg p-2"
                  value={form.starRating} onChange={(e)=>setVal("starRating", Number(e.target.value)||0)} />
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Types de chambres</div>
              {form.roomTypes.map((rt, i) => (
                <div key={i} className="p-4 border rounded-xl mb-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Nom du type</label>
                      <input className="mt-1 w-full border rounded-lg p-2"
                        value={rt.name}
                        onChange={(e)=>{
                          const arr = [...form.roomTypes]; arr[i] = { ...rt, name: e.target.value }; setVal("roomTypes", arr);
                        }}
                        placeholder="Chambre Double Standard" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Unités</label>
                      <input type="number" min={0} className="mt-1 w-full border rounded-lg p-2"
                        value={rt.totalUnits}
                        onChange={(e)=>{
                          const arr = [...form.roomTypes]; arr[i] = { ...rt, totalUnits: Number(e.target.value)||0 }; setVal("roomTypes", arr);
                        }} required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Prix de base / nuit (DZD)</label>
                      <input type="number" min={0} className="mt-1 w-full border rounded-lg p-2"
                        value={rt.basePriceDZD}
                        onChange={(e)=>{
                          const arr = [...form.roomTypes]; arr[i] = { ...rt, basePriceDZD: Number(e.target.value)||0 }; setVal("roomTypes", arr);
                        }} required />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium">Voyageurs</label>
                      <input type="number" min={1} className="mt-1 w-full border rounded-lg p-2"
                        value={rt.capacity.guests}
                        onChange={(e)=>{
                          const arr = [...form.roomTypes];
                          arr[i] = { ...rt, capacity: { ...rt.capacity, guests: Number(e.target.value)||1 } };
                          setVal("roomTypes", arr);
                        }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Lits</label>
                      <input type="number" min={0} className="mt-1 w-full border rounded-lg p-2"
                        value={rt.capacity.beds}
                        onChange={(e)=>{
                          const arr = [...form.roomTypes];
                          arr[i] = { ...rt, capacity: { ...rt.capacity, beds: Number(e.target.value)||0 } };
                          setVal("roomTypes", arr);
                        }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Salles de bain</label>
                      <input type="number" min={0} className="mt-1 w-full border rounded-lg p-2"
                        value={rt.capacity.bathrooms}
                        onChange={(e)=>{
                          const arr = [...form.roomTypes];
                          arr[i] = { ...rt, capacity: { ...rt.capacity, bathrooms: Number(e.target.value)||0 } };
                          setVal("roomTypes", arr);
                        }} />
                    </div>
                  </div>

                  {/* room-type images */}
                  <div className="mt-4">
                    <ImagePicker
                      label="Photos de ce type"
                      files={rt.files || []}
                      onChange={(files)=>{
                        const arr = [...form.roomTypes]; arr[i] = { ...rt, files }; setVal("roomTypes", arr);
                      }}
                    />
                  </div>

                  <div className="mt-3 text-right">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border text-sm"
                      onClick={()=>{
                        const arr = [...form.roomTypes]; arr.splice(i,1);
                        setVal("roomTypes", arr.length ? arr : [{
                          name:"", totalUnits:0, basePriceDZD:0,
                          capacity:{guests:2,beds:1,bathrooms:1}, amenities:[], files:[]
                        }]);
                      }}
                    >
                      Supprimer ce type
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="px-3 py-1.5 rounded-lg border text-sm" onClick={addRoomType}>
                + Ajouter un type de chambre
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium">Voyageurs</label>
                <input type="number" min={1} className="mt-1 w-full border rounded-lg p-2"
                  value={form.capacity.guests} onChange={(e)=>setCapacity("guests", Number(e.target.value)||1)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Chambres</label>
                <input type="number" min={0} className="mt-1 w-full border rounded-lg p-2"
                  value={form.capacity.bedrooms} onChange={(e)=>setCapacity("bedrooms", Number(e.target.value)||0)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Lits</label>
                <input type="number" min={0} className="mt-1 w-full border rounded-lg p-2"
                  value={form.capacity.beds} onChange={(e)=>setCapacity("beds", Number(e.target.value)||0)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Salles de bain</label>
                <input type="number" min={0} className="mt-1 w-full border rounded-lg p-2"
                  value={form.capacity.bathrooms} onChange={(e)=>setCapacity("bathrooms", Number(e.target.value)||0)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Prix de base (DZD)</label>
              <input type="number" min={0} className="mt-1 w-full border rounded-lg p-2"
                value={form.basePriceDZD} onChange={(e)=>setVal("basePriceDZD", Number(e.target.value)||0)} />
            </div>

            <div>
              <div className="text-sm font-semibold mb-2">Équipements</div>
              <div className="flex flex-wrap">
                {AMENITIES.map((a) => (
                  <label key={a} className="inline-flex items-center gap-2 mr-3 mb-2 px-3 py-1.5 border rounded-full">
                    <input
                      type="checkbox"
                      className="accent-[#c34d54]"
                      checked={form.amenities.includes(a)}
                      onChange={(e)=>toggleAmenity(a, e.target.checked)}
                    />
                    <span className="text-sm">{a}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        <div>
          <button className="btn-light" disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer l’hôtel"}
          </button>
        </div>
      </form>
    </div>
  );
}
