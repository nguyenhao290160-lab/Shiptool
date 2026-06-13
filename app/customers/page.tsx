import React from "react";
import { CustomerManager } from "@/components/CustomerManager";

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        <CustomerManager />
      </div>
    </div>
  );
}
