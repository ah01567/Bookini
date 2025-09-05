import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import AuthHeader from "../../ui/AuthHeader.jsx";

export default function HostLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      nav("/host");
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-[calc(100vh-3.5rem)] grid place-items-center bg-slate-50 p-4">
        <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border">
          <h1 className="text-xl font-bold mb-2">Connexion Hôte</h1>
          <p className="text-sm text-slate-600 mb-6">Gérez vos établissements sur Bookini.</p>

          <label className="block text-sm font-medium">Email</label>
          <input className="mt-1 mb-4 w-full border rounded-lg p-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />

          <label className="block text-sm font-medium">Mot de passe</label>
          <input className="mt-1 mb-4 w-full border rounded-lg p-2" type="password" value={pass} onChange={e=>setPass(e.target.value)} required />

          {err && <p className="text-sm text-red-600 mb-3">{err}</p>}
          <button className="btn-light w-full" disabled={busy}>{busy ? "Connexion..." : "Se connecter"}</button>

          <p className="text-sm text-slate-600 mt-4">
            Nouveau ? <Link to="/host/register" className="text-primary underline">Créer un compte hôte</Link>
          </p>
        </form>
      </div>
    </>
  );
}
