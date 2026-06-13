import { useEffect, useState } from "react";

export function useOnlineStatus() {
  // Always start as null for SSR consistency — real value set in useEffect
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  useEffect(() => {
    // Set the initial value once mounted on the client
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
