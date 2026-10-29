import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useSession } from "../context/SessionContext";
import { Spinner } from "./Spinner";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { ready } = useSession();
  if (!ready)
    return (
      <main className="grid min-h-screen place-items-center">
        <Spinner label="Checking your session…" />
      </main>
    );
  return localStorage.getItem("token") ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
}
