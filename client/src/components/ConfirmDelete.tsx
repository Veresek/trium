import { Dialog } from "./Dialog";

interface ConfirmDeleteProps {
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel?: string;
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDelete({
  title,
  description,
  confirmLabel,
  pendingLabel = "Deleting…",
  pending = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDeleteProps) {
  return (
    <Dialog
      onClose={() => {
        if (!pending) {
          onCancel();
        }
      }}
      title={title}
    >
      <p className="text-sm leading-6 text-ink-soft">{description}</p>
      {error ? (
        <p className="mt-3 text-sm text-rust" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="rounded-md bg-rust px-4 py-2 text-sm font-medium text-paper-raised disabled:cursor-not-allowed disabled:opacity-50"
          disabled={pending}
          onClick={onConfirm}
          type="button"
        >
          {pending ? pendingLabel : confirmLabel}
        </button>
        <button
          className="rounded-md border border-line px-4 py-2 text-sm text-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
          disabled={pending}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>
    </Dialog>
  );
}
