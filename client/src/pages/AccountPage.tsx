import { useState } from "react";

import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import {
  authErrorClassName,
  buttonClassName,
} from "../components/AuthCard";
import { ConfirmDelete } from "../components/ConfirmDelete";

export function AccountPage() {
  const { user, logout, deleteAccount } = useAuth();
  const [pendingAction, setPendingAction] = useState<
    "logout" | "delete" | null
  >(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setError(null);
    setPendingAction("logout");
    try {
      await logout();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "You could not be logged out. Please try again.",
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDelete() {
    setError(null);
    setPendingAction("delete");
    try {
      await deleteAccount();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Your account could not be deleted. Please try again.",
      );
      setPendingAction(null);
    }
  }

  const pending = pendingAction !== null;

  return (
    <div
      aria-busy={pending}
      className="mx-auto w-full max-w-xl px-4 py-8 md:px-8 md:py-12"
    >
      <p className="text-sm text-ink-soft">Your instance</p>
      <h1 className="mt-2 font-serif text-3xl md:text-4xl">Account</h1>
      <p className="mt-6 text-sm text-ink">{user?.email}</p>
      <button
        className={buttonClassName}
        disabled={pending}
        onClick={() => void handleLogout()}
        type="button"
      >
        {pendingAction === "logout" ? "Logging out…" : "Log out"}
      </button>
      <section
        aria-labelledby="danger-zone-title"
        className="mt-12 border-t border-line pt-8"
      >
        <h2 className="font-serif text-2xl text-rust" id="danger-zone-title">
          Delete account
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Permanently delete your account, all of its data, and every active
          session. This cannot be undone.
        </p>
        <button
          className="mt-5 rounded-md border border-rust/40 px-4 py-2 text-sm text-rust hover:bg-paper-raised disabled:cursor-not-allowed disabled:opacity-50"
          disabled={pending}
          onClick={() => {
            setConfirmingDelete(true);
            setError(null);
          }}
          type="button"
        >
          Delete my account
        </button>
        {confirmingDelete ? (
          <ConfirmDelete
            confirmLabel="Yes, delete my account"
            description="Choose cancel to keep your account and all of its data."
            error={error}
            onCancel={() => {
              setConfirmingDelete(false);
              setError(null);
            }}
            onConfirm={() => void handleDelete()}
            pending={pendingAction === "delete"}
            pendingLabel="Deleting account…"
            title="Delete your account permanently?"
          />
        ) : null}
      </section>
      {error && !confirmingDelete ? (
        <p aria-live="assertive" className={authErrorClassName} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
