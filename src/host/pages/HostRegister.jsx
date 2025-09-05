import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import AuthHeader from "../../ui/AuthHeader.jsx";

export default function HostRegister() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });

      // Create user doc with role "host" (so AuthContext won't overwrite)
      await setDoc(doc(db, "users", cred.user.uid), {
        displayName: name, email, role: "host",
        defaultCurrency: "DZD",
        hostProfile: { kycStatus: "pending" },
        createdAt: serverTimestamp(),
      });

      nav("/host");
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-[calc(100vh-3.5rem)] grid place-items-center bg-slate-50 p-4">
        <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border">
          <h1 className="text-xl font-bold mb-2">Créer un compte Hôte</h1>
          <p className="text-sm text-slate-600 mb-6">Inscrivez votre établissement sur Bookini.</p>

          <label className="block text-sm font-medium">Nom</label>
          <input className="mt-1 mb-4 w-full border rounded-lg p-2" value={name} onChange={e=>setName(e.target.value)} required />

          <label className="block text-sm font-medium">Email</label>
          <input className="mt-1 mb-4 w-full border rounded-lg p-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />

          <label className="block text-sm font-medium">Mot de passe</label>
          <input className="mt-1 mb-4 w-full border rounded-lg p-2" type="password" value={pass} onChange={e=>setPass(e.target.value)} required />

          {err && <p className="text-sm text-red-600 mb-3">{err}</p>}
          <button className="btn-light w-full" disabled={busy}>{busy ? "Création..." : "S’inscrire"}</button>

          <p className="text-sm text-slate-600 mt-4">
            Déjà inscrit ? <Link to="/host/login" className="text-primary underline">Se connecter</Link>
          </p>
        </form>
      </div>
    </>
  );
}
