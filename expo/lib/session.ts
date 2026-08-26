import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const SESSION_KEY = "borlawura.session";
let activeToken: string | null = null;

export function getActiveToken() {
  return activeToken;
}

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
    const session = JSON.parse(raw) as SessionState;
    activeToken = session.token;
    return session;
  } catch {
    return null;
  }
}

export async function saveSession(session: SessionState) {
  activeToken = session.token;
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function saveGuestSession(role: SessionUser["role"]) {
  const id = `guest_${role}_${Date.now()}`;
  const session: SessionState = {
    token: `guest_token_${Date.now()}`,
    user: {
      id,
      name:
        role === "collector"
          ? "Guest Collector"
          : role === "admin"
            ? "Guest Admin"
            : "Guest User",
      phone: `guest-${role}`,
      role,
    },
  };
  await saveSession(session);
  return session;
}

export async function clearSession() {
  activeToken = null;
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

