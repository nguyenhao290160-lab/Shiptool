"use client";

import React, { useEffect } from "react";
import { OfflineStatusBanner } from "./OfflineStatusBanner";

export function RootClientWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker in production
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration failed - app will still work
      });
    }
  }, []);

  return (
    <>
      <OfflineStatusBanner />
      <div className="pt-14">{children}</div>
    </>
  );
}
