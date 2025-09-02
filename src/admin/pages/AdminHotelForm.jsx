import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AdminHotelForm() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: "", type: "hotel",
    wilaya: "", commune: "", address: "",
    basePriceDZD: 0
  });
  const [saving, setSaving] = useState(false);

  const setVal = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const docRef = await addDoc(collection(db, "properties"), {
      title: form.title,
      type: form.type,
      propertyKind: "hotel",
      status: "pending_review",
      location: { country: "DZ", wilaya: form.wilaya, commune: form.commune, address: form.address },
      amenities: [],
      basePriceDZD: Number(form.basePriceDZD) || 0,
      ratingAvg: 0, ratingCount: 0,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    setSaving(false);
    nav(`/admin/hotels/${docRef.id}/analytics`);
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <h1 className="text-xl font-bold mb-4">Ajouter un hôtel</h1>
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Nom de l’hôtel</label>
          <input className="mt-1 w-full border rounded-lg p-2" value={form.title} onChange={e=>setVal("title", e.target.value)} required/>
        </div>

        <div>
          <label className="block text-sm font-medium">Type</label>
          <select className="mt-1 w-full border rounded-lg p-2" value={form.type} onChange={e=>setVal("type", e.target.value)}>
            <option value="hotel">Hôtel</option>
            <option value="guesthouse">Maison d’hôtes</option>
            <option value="apartment">Appartement</option>
            <option value="house">Maison</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Wilaya</label>
          <input className="mt-1 w-full border rounded-lg p-2" value={form.wilaya} onChange={e=>setVal("wilaya", e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Commune</label>
          <input className="mt-1 w-full border rounded-lg p-2" value={form.commune} onChange={e=>setVal("commune", e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Adresse</label>
          <input className="mt-1 w-full border rounded-lg p-2" value={form.address} onChange={e=>setVal("address", e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Prix de base (DZD)</label>
          <input type="number" className="mt-1 w-full border rounded-lg p-2" value={form.basePriceDZD} onChange={e=>setVal("basePriceDZD", e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <button className="btn-light" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer l’hôtel"}</button>
        </div>
      </form>
    </div>
  );
}
