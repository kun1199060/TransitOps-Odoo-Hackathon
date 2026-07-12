import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

// Real-time hook: subscribes to a Firestore collection and keeps React state in sync.
export function useCollection(name, orderField = null) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = collection(db, name);
    const q = orderField ? query(ref, orderBy(orderField)) : query(ref);
    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [name, orderField]);

  return { data, loading };
}
