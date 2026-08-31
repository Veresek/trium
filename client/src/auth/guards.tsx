import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "./AuthProvider";

function SessionStatus() {
  return (
    <main
      aria-busy="true"
      className="grid min-h-screen place-items-center bg-paper px-4 text-ink"
    >
      <p
        aria-live="polite"
        className="text-sm text-ink-soft"
        role="status"
      >
        Opening your session…
      </p>
    </main>
  );
}

export function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SessionStatus />;
  }
  if (!user) {
    return <Navigate replace to="/login" />;
  }
  return <Outlet />;
}

export function GuestOnly() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SessionStatus />;
  }
  if (user) {
    return <Navigate replace to="/" />;
  }
  return <Outlet />;
}
