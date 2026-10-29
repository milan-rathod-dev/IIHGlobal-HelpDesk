import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";
import type { User } from "../types";

type SessionValue = {
  user: User | null;
  setUser: (user: User | null) => void;
  ready: boolean;
};
const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(() => !localStorage.getItem("token"));

  useEffect(() => {
    const expired = () => {
      setUser(null);
      setReady(true);
    };
    window.addEventListener("auth:expired", expired);
    if (localStorage.getItem("token")) {
      api<{ user: User }>("/auth/me")
        .then(({ user: profile }) => {
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        })
        .finally(() => setReady(true));
    }
    return () => window.removeEventListener("auth:expired", expired);
  }, []);

  return (
    <SessionContext.Provider value={{ user, setUser, ready }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
