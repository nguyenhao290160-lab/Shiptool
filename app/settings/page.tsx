"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MobilePageShell } from "@/components/MobilePageShell";
import { SettingsApiCenter } from "@/components/SettingsApiCenter";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <MobilePageShell>
      <div className="space-y-5">
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold text-sm mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
        <SettingsApiCenter />
      </div>
    </MobilePageShell>
  );
}
