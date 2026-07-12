import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext(null);

// Role → module access map (drives Settings & RBAC screen + route guarding)
export const ROLE_ACCESS = {
  "Fleet Manager": { fleet: "edit", drivers: "edit", trips: "none", fuel: "none", analytics: "view" },
  "Dispatcher": { fleet: "view", drivers: "none", trips: "edit", fuel: "none", analytics: "none" },
  "Safety Officer": { fleet: "none", drivers: "edit", trips: "view", fuel: "none", analytics: "none" },
  "Financial Analyst": { fleet: "view", drivers: "none", trips: "none", fuel: "edit", analytics: "edit" },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // { name, role }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) setProfile(snap.data());
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const signup = async (email, password, name, role) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userProfile = { name, role, email };
    await setDoc(doc(db, "users", cred.user.uid), userProfile);
    setProfile(userProfile);
    return cred;
  };

  const logout = () => signOut(auth);

  const can = (module) => {
    if (!profile) return "none";
    return ROLE_ACCESS[profile.role]?.[module] ?? "none";
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
