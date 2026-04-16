import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const SESSION_KEY = "borlawura.session";

export type SessionUser = {
  id: string;
  name: string;
  phone: string;
  role: "user" | "collector" | "admin";
};

export type SessionState = {
  token: string;
  user: SessionUser;
};

export async function getSession(): Promise<SessionState | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

export async function saveSession(session: SessionState) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export function useSession() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const current = await getSession();
      setSession(current);
      setLoading(false);
    })();
  }, []);

  return { session, setSession, loading };
}

