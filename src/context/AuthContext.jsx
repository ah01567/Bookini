import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const ensureUserDoc = async (u) => {
    const ref = doc(db, "users", u.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        displayName: u.displayName || "",
        email: u.email || "",
        role: "admin", // DEV: admin par défaut
        defaultCurrency: "DZD",
        createdAt: serverTimestamp(),
      });
      return (await getDoc(ref)).data();
    }
    return snap.data();
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);
        if (u) {
          // Empêche l’écran blanc si Firestore renvoie 400/permission-denied, etc.
          const data = await ensureUserDoc(u).catch((e) => {
            console.error("⚠️ Chargement profil échoué:", e);
            // On fournit un profil minimal pour que l’app continue
            return { displayName: u.displayName || "", email: u.email || "", role: "admin" };
          });
          setProfile({ id: u.uid, ...data });
        } else {
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const value = { user, profile, isAdmin: profile?.role === "admin", signOut: () => signOut(auth) };
  return <AuthCtx.Provider value={value}>{!loading && children}</AuthCtx.Provider>;
}
