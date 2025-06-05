"use client";

import { useState } from "react";

const ProductFilters = ({ filters, onFilterChange, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const clearFilters = () => {
    setSearchTerm("");
    onFilterChange({
      category: "",
      petTypes: "",
      minPrice: "",
      maxPrice: "",
      brand: "",
      search: "",
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Xóa tất cả
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tìm kiếm
        </label>
        <form onSubmit={handleSearchSubmit}>
          <div className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tên sản phẩm, thương hiệu..."
              className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Danh mục
        </label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả danh mục</option>
          <option value="food">Thức ăn</option>
          <option value="toy">Đồ chơi</option>
          <option value="accessory">Phụ kiện</option>
          <option value="health">Sức khỏe</option>
          <option value="grooming">Chăm sóc</option>
          <option value="housing">Nhà ở</option>
        </select>
      </div>

      {/* Pet Types Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dành cho
        </label>
        <select
          value={filters.petTypes}
          onChange={(e) => handleFilterChange("petTypes", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả thú cưng</option>
          <option value="dog">Chó</option>
          <option value="cat">Mèo</option>
          <option value="bird">Chim</option>
          <option value="fish">Cá</option>
          <option value="rabbit">Thỏ</option>
          <option value="hamster">Chuột hamster</option>
          <option value="all">Tất cả loại</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Khoảng giá (VNĐ)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Từ"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Đến"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Brand */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thương hiệu
        </label>
        <input
          type="text"
          placeholder="Nhập tên thương hiệu"
          value={filters.brand}
          onChange={(e) => handleFilterChange("brand", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Quick Filters */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Bộ lọc nhanh</h4>
        <div className="space-y-2">
          <button
            onClick={() => handleFilterChange("category", "food")}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
          >
            🍖 Thức ăn
          </button>
          <button
            onClick={() => handleFilterChange("category", "toy")}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
          >
            🎾 Đồ chơi
          </button>
          <button
            onClick={() => handleFilterChange("category", "health")}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
          >
            💊 Sức khỏe
          </button>
          <button
            onClick={() => handleFilterChange("category", "accessory")}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
          >
            🎀 Phụ kiện
          </button>
          <button
            onClick={() => {
              handleFilterChange("maxPrice", "500000");
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
          >
            💰 Dưới 500k
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
