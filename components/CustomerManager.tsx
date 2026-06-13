"use client";

import React, { useState, useEffect } from "react";
import { FrequentCustomer } from "@/lib/types";
import {
  getFrequentCustomers,
  createFrequentCustomer,
  updateFrequentCustomer,
  deleteFrequentCustomer,
  calculateStats,
} from "@/lib/customerStorage";
import { filterCustomers, sortCustomers as sortCustomersUtil } from "@/lib/customerUtils";
import { CustomerStats } from "./CustomerStats";
import { CustomerCard } from "./CustomerCard";
import { CustomerForm } from "./CustomerForm";
import { Modal } from "./Modal";

type SortType = "recency" | "orders" | "withCoords" | "withoutCoords";

export const CustomerManager: React.FC = () => {
  const [customers, setCustomers] = useState<FrequentCustomer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<FrequentCustomer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState<SortType>("recency");
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<FrequentCustomer | undefined>();
  const [loading, setLoading] = useState(true);

  // Apply filters and sort (move before useEffect)
  const applyFiltersAndSort = (
    data: FrequentCustomer[],
    search: string,
    sort: SortType
  ) => {
    let result = data;

    // Search
    if (search.trim()) {
      result = filterCustomers(result, search);
    }

    // Sort: map local sort keys to util sort keys
    const mapSort = (s: SortType) => {
      switch (s) {
        case "recency":
          return "recent" as const;
        case "orders":
          return "most-orders" as const;
        case "withCoords":
          return "has-coords" as const;
        case "withoutCoords":
          return "no-coords" as const;
        default:
          return "recent" as const;
      }
    };

    result = sortCustomersUtil(result, mapSort(sort));

    setFilteredCustomers(result);
  };

  // Load customers on mount
  useEffect(() => {
    const loadCustomers = () => {
      const loaded = getFrequentCustomers();
      setCustomers(loaded);
      applyFiltersAndSort(loaded, searchTerm, sortType);
      setLoading(false);
    };

    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    applyFiltersAndSort(customers, term, sortType);
  };

  // Handle sort change
  const handleSortChange = (sort: SortType) => {
    setSortType(sort);
    applyFiltersAndSort(customers, searchTerm, sort);
  };

  // Handle add/edit customer
  const handleAddCustomer = () => {
    setEditingCustomer(undefined);
    setShowForm(true);
  };

  const handleEditCustomer = (customer: FrequentCustomer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDeleteCustomer = (customer: FrequentCustomer) => {
    if (
      confirm(
        `Bạn có chắc muốn xóa khách hàng "${customer.name}" khỏi danh sách thường xuyên không?`
      )
    ) {
      deleteFrequentCustomer(customer.id);
      const updated = customers.filter((c) => c.id !== customer.id);
      setCustomers(updated);
      applyFiltersAndSort(updated, searchTerm, sortType);
    }
  };

  const handleFormSubmit = async (
    data: Omit<FrequentCustomer, "id" | "createdAt" | "updatedAt">
  ) => {
    if (editingCustomer) {
      // Update existing
      const updated = updateFrequentCustomer(editingCustomer.id, data);
      if (updated) {
        const newCustomers = customers.map((c) => (c.id === updated.id ? updated : c));
        setCustomers(newCustomers);
        applyFiltersAndSort(newCustomers, searchTerm, sortType);
      }
    } else {
      // Create new
      const created = createFrequentCustomer(data);
      const newCustomers = [...customers, created];
      setCustomers(newCustomers);
      applyFiltersAndSort(newCustomers, searchTerm, sortType);
    }
    setShowForm(false);
    setEditingCustomer(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-sm">Đang tải danh sách khách hàng...</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats(customers);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Khách hàng thường xuyên
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Quản lý danh sách khách hàng để giao hàng nhanh hơn
          </p>
        </div>
        <button
          onClick={handleAddCustomer}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm whitespace-nowrap"
        >
          + Thêm khách mới
        </button>
      </div>

      {/* Stats */}
      <CustomerStats stats={stats} />

      {/* Search, Sort, Filter */}
      <div className="space-y-3">
        {/* Search */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Tìm theo tên, điện thoại, địa chỉ, ghi chú hoặc tag..."
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Sort buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleSortChange("recency")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              sortType === "recency"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            🕐 Giao gần đây
          </button>
          <button
            onClick={() => handleSortChange("orders")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              sortType === "orders"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            📦 Nhiều đơn
          </button>
          <button
            onClick={() => handleSortChange("withCoords")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              sortType === "withCoords"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            📍 Có tọa độ
          </button>
          <button
            onClick={() => handleSortChange("withoutCoords")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              sortType === "withoutCoords"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            ❓ Chưa tọa độ
          </button>
        </div>
      </div>

      {/* Customer list */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-slate-600 text-sm font-medium">
            {customers.length === 0
              ? "Chưa có khách hàng thường xuyên. Hãy thêm khách thủ công hoặc tạo đơn giao để bắt đầu."
              : "Không tìm thấy khách hàng phù hợp."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
            />
          ))}
        </div>
      )}

      {/* Modal for form */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            {editingCustomer ? "Sửa khách hàng" : "Thêm khách mới"}
          </h2>
          <CustomerForm
            customer={editingCustomer}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </Modal>
    </div>
  );
};
