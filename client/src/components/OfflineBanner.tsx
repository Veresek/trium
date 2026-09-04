import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(
    () => typeof navigator !== "undefined" && navigator.onLine === false,
  );

  useEffect(() => {
    function goOnline() {
      setOffline(false);
    }
    function goOffline() {
      setOffline(true);
    }
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!offline) {
    return null;
  }

  return (
    <div
      className="border-b border-rust/40 bg-paper-raised px-4 py-2 text-center text-sm text-rust"
      role="status"
    >
      You are offline. Changes will not be saved until you reconnect.
    </div>
  );
}
