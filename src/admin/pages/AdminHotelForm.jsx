import { useState } from "react";
import {
  addDoc, collection, serverTimestamp, updateDoc, doc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import { useNavigate } from "react-router-dom";
import ImagePicker from "../../ui/ImagePicker";

// ----- helpers & constants -----
const AMENITIES = ["wifi","ac","heating","parking","kitchen","tv","elevator","washer","dryer","breakfast","pool","spa"];
const TYPE_OPTIONS = [
  { value: "hotel", label: "Hôtel" },
  { value: "guesthouse", label: "Maison d’hôtes" },
  { value: "apartment", label: "Appartement" },
  { value: "house", label: "Maison" },
];

// Upload multiple files to a storage prefix; return [{src,path,contentType,size}]
async function uploadFiles(files, prefix, onEachProgress) {
  const out = [];
  for (const file of files || []) {
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
    const r = ref(storage, `${prefix}/${filename}`);
    const task = uploadBytesResumable(r, file, {
      contentType: file.type,
      cacheControl: "public, max-age=31536000, immutable",
    });
    await new Promise((resolve, reject) => {
      task.on("state_changed", (snap) => onEachProgress?.(file, snap), reject, resolve);
    });
    const src = await getDownloadURL(task.snapshot.ref);
    out.push({ src, path: task.snapshot.ref.fullPath, contentType: file.type, size: file.size });
  }
  return out;
}

// ----- room type row -----
function AmenityCheckbox({ value, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-2 mr-3 mb-2 px-3 py-1.5 border rounded-full">
      <input type="checkbox" className="accent-[#c34d54]" checked={checked}
        onChange={(e)=>onChange(value, e.target.checked)} />
      <span className="text-sm">{value}</span>
    </label>
  );
}

function RoomTypeRow({ rt, onChange, onRemove }) {
  const set = (k, v) => onChange({ ...rt, [k]: v });
  const setCap = (k, v) => onChange({ ...rt, capacity: { ...rt.capacity, [k]: v } });
  const toggleAmenity = (key, isOn) => {
    const next = new Set(rt.amenities || []);
    isOn ? next.add(key) : next.delete(key);
    set("amenities", Array.from(next));
  };
  return (
    <div className="p-4 border rounded-xl mb-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Nom du type</label>
          <input className="mt-1 w-full border rounded-lg p-2" value={rt.name}
            onChange={(e)=>set("name", e.target.value)} placeholder="Chambre Double Standard" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Unités (nb de chambres)</label>
          <input type="number" min={0} className="mt-1 w-full border rounded-lg p-2"
            value={rt.totalUnits} onChange={(e)=>set("totalUnits", Number(e.target.value)||0)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Prix de base / nuit (DZD)</label>
          <input type="number" min={0} className="mt-1 w-full border rounded-lg p-2"
            value={rt.basePriceDZD} onChange={(e)=>set("basePriceDZD", Number(e.target.value)||0)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Capacité – Voyageurs</label>
          <input type="number" min={1} className="mt-1 w-full border rounded-lg p-2"
            value={rt.capacity.guests} onChange={(e)=>setCap("guests", Number(e.target.value)||1)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Lits</label>
          <input type="number" min={0} className="mt-1 w-full border rounded-lg p-2"
            value={rt.capacity.beds} onChange={(e)=>setCap("beds", Number(e.target.value)||0)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Salles de bain</label>
          <input type="number" min={0} className="mt-1 w-full border rounded-lg p-2"
            value={rt.capacity.bathrooms} onChange={(e)=>setCap("bathrooms", Number(e.target.value)||0)} />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm font-medium mb-2">Équipements</div>
        <div className="flex flex-wrap">
          {AMENITIES.map(a => (
            <AmenityCheckbox key={a} value={a} checked={rt.amenities?.includes(a)} onChange={toggleAmenity} />
          ))}
        </div>
      </div>

      {/* Room-type images */}
      <div className="mt-4">
        <ImagePicker
          label="Photos de ce type"
          files={rt.files || []}
          onChange={(files) => set("files", files)}
        />
      </div>

      <div className="mt-3 text-right">
        <button type="button" onClick={onRemove} className="px-3 py-1.5 rounded-lg border text-sm">
          Supprimer ce type
        </button>
      </div>
    </div>
  );
}

// ----- main form -----
export default function AdminHotelForm() {
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    type: "hotel",
    wilaya: "", commune: "", address: "",
    description: "",
    basePriceDZD: 0,
    starRating: 3,
    amenities: [],
    capacity: { guests: 2, bedrooms: 1, beds: 1, bathrooms: 1 },
    policies: {
      checkInFrom: "14:00",
      checkInTo: "00:00",
      checkOutUntil: "11:00",
      smoking: false, pets: false, cancellation: ""
    },
    // images
    propertyFiles: [], // property-level photos
    roomTypes: [{
      name: "", totalUnits: 0, basePriceDZD: 0,
      capacity: { guests: 2, beds: 1, bathrooms: 1 },
      amenities: [], files: [] // room-type photos
    }]
  });

  const isHotelKind = ["hotel", "guesthouse"].includes(form.type);
  const propertyKind = isHotelKind ? "hotel" : "single_unit";
  const setVal = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const setPolicy = (k, v) => setForm((s) => ({ ...s, policies: { ...s.policies, [k]: v } }));
  const setCapacity = (k, v) => setForm((s) => ({ ...s, capacity: { ...s.capacity, [k]: v } }));
  const toggleAmenity = (key, on) => {
    setForm((s) => {
      const set = new Set(s.amenities);
      on ? set.add(key) : set.delete(key);
      return { ...s, amenities: Array.from(set) };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!form.title.trim()) throw new Error("Le nom de l’hôtel est requis.");
      if (isHotelKind) {
        const ok = form.roomTypes.some(rt => rt.name && rt.totalUnits > 0);
        if (!ok) throw new Error("Ajoutez au moins un type de chambre (>0).");
      }

      // 1) Create property doc first (we need its id for storage paths)
      const propData = {
        hostId: null, orgId: null,
        title: form.title.trim(),
        type: form.type,
        propertyKind,
        status: "pending_review",
        location: { country: "DZ", wilaya: form.wilaya || "", commune: form.commune || "", address: form.address || "", },
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
        policies: {
          checkInFrom: form.policies.checkInFrom,
          checkInTo: form.policies.checkInTo,
          checkOutUntil: form.policies.checkOutUntil,
          smoking: !!form.policies.smoking,
          pets: !!form.policies.pets,
          cancellation: form.policies.cancellation || ""
        },
        photos: [], // will fill after uploads
        ratingAvg: 0, ratingCount: 0,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      };
      const propRef = await addDoc(collection(db, "properties"), propData);

      // 2) Upload property images (if any) and update
      let propertyPhotos = [];
      if (form.propertyFiles?.length) {
        propertyPhotos = await uploadFiles(form.propertyFiles, `properties/${propRef.id}/property`);
        await updateDoc(doc(db, "properties", propRef.id), { photos: propertyPhotos, updatedAt: serverTimestamp() });
      }

      // 3) If hotel kind: create roomTypes, upload each roomType images, then update roomType doc
      if (isHotelKind) {
        const valid = form.roomTypes.filter(rt => rt.name && rt.totalUnits > 0);
        for (const rt of valid) {
          const rtRef = await addDoc(collection(db, "properties", propRef.id, "roomTypes"), {
            name: rt.name,
            totalUnits: Number(rt.totalUnits)||0,
            basePriceDZD: Number(rt.basePriceDZD)||0,
            capacity: {
              guests: Number(rt.capacity.guests)||1,
              beds: Number(rt.capacity.beds)||0,
              bathrooms: Number(rt.capacity.bathrooms)||0
            },
            amenities: rt.amenities || [],
            photos: [],
            createdAt: serverTimestamp()
          });

          if (rt.files?.length) {
            const photos = await uploadFiles(rt.files, `properties/${propRef.id}/roomTypes/${rtRef.id}`);
            await updateDoc(rtRef, { photos });
          }
        }
      }

      // 4) Done
      nav(`/admin/hotels/${propRef.id}/analytics`);
    } catch (err) {
      alert(err.message || String(err));
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
          <input className="mt-1 w-full border rounded-lg p-2" value={form.title}
            onChange={(e)=>setVal("title", e.target.value)} required />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select className="mt-1 w-full border rounded-lg p-2" value={form.type}
              onChange={(e)=>setVal("type", e.target.value)}>
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Wilaya</label>
            <input className="mt-1 w-full border rounded-lg p-2" value={form.wilaya}
              onChange={(e)=>setVal("wilaya", e.target.value)} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Commune</label>
            <input className="mt-1 w-full border rounded-lg p-2" value={form.commune}
              onChange={(e)=>setVal("commune", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Adresse</label>
            <input className="mt-1 w-full border rounded-lg p-2" value={form.address}
              onChange={(e)=>setVal("address", e.target.value)} />
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
          onChange={(files) => setVal("propertyFiles", files)}
        />

        {/* Dynamic sections */}
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
                <RoomTypeRow
                  key={i}
                  rt={rt}
                  onChange={(next) => {
                    const copy = [...form.roomTypes]; copy[i] = next; setVal("roomTypes", copy);
                  }}
                  onRemove={() => {
                    const copy = [...form.roomTypes]; copy.splice(i, 1);
                    setVal("roomTypes", copy.length ? copy : [{
                      name:"", totalUnits:0, basePriceDZD:0,
                      capacity:{guests:2,beds:1,bathrooms:1}, amenities:[], files:[]
                    }]);
                  }}
                />
              ))}
              <button type="button" className="px-3 py-1.5 rounded-lg border text-sm"
                onClick={() => setVal("roomTypes", [...form.roomTypes, {
                  name:"", totalUnits:0, basePriceDZD:0,
                  capacity:{guests:2,beds:1,bathrooms:1}, amenities:[], files:[]
                }])}>
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
                {AMENITIES.map(a => (
                  <AmenityCheckbox key={a} value={a}
                    checked={form.amenities.includes(a)}
                    onChange={toggleAmenity}/>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Policies */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Arrivée à partir de</label>
            <input type="time" className="mt-1 w-full border rounded-lg p-2"
              value={form.policies.checkInFrom} onChange={(e)=>setPolicy("checkInFrom", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Arrivée jusqu’à</label>
            <input type="time" className="mt-1 w-full border rounded-lg p-2"
              value={form.policies.checkInTo} onChange={(e)=>setPolicy("checkInTo", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Départ jusqu’à</label>
            <input type="time" className="mt-1 w-full border rounded-lg p-2"
              value={form.policies.checkOutUntil} onChange={(e)=>setPolicy("checkOutUntil", e.target.value)} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="accent-[#c34d54]"
              checked={form.policies.smoking} onChange={(e)=>setPolicy("smoking", e.target.checked)} />
            <span>Fumeurs autorisés</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="accent-[#c34d54]"
              checked={form.policies.pets} onChange={(e)=>setPolicy("pets", e.target.checked)} />
            <span>Animaux acceptés</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium">Politique d’annulation</label>
          <textarea rows={3} className="mt-1 w-full border rounded-lg p-2"
            value={form.policies.cancellation} onChange={(e)=>setPolicy("cancellation", e.target.value)} />
        </div>

        <div>
          <button className="btn-light" disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer l’hôtel"}
          </button>
        </div>
      </form>
    </div>
  );
}
