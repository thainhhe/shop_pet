"use client";

import { useState } from "react";

const PetFilters = ({ filters, onFilterChange, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || "");

  const [localCity, setLocalCity] = useState(filters.city || "");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const applyLocationFilter = () => {
    onFilterChange({ city: localCity });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocalMaxPrice("");
    setLocalMinPrice("");
    setLocalCity("");
    onFilterChange({
      species: "",
      size: "",
      minPrice: "",
      maxPrice: "",
      city: "",
      isForAdoption: "",
      search: "",
    });
  };
  const applyPriceFilter = () => {
    onFilterChange({
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
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
              placeholder="Giống, mô tả..."
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

      {/* Species Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loài thú cưng
        </label>
        <select
          value={filters.species}
          onChange={(e) => handleFilterChange("species", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả</option>
          <option value="dog">Chó</option>
          <option value="cat">Mèo</option>
          <option value="bird">Chim</option>
          <option value="fish">Cá</option>
          <option value="rabbit">Thỏ</option>
          <option value="hamster">Chuột hamster</option>
          <option value="other">Khác</option>
        </select>
      </div>

      {/* Size Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kích thước
        </label>
        <select
          value={filters.size}
          onChange={(e) => handleFilterChange("size", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả</option>
          <option value="small">Nhỏ</option>
          <option value="medium">Trung bình</option>
          <option value="large">Lớn</option>
          <option value="extra_large">Rất lớn</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Khoảng giá (VNĐ)
        </label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            type="number"
            placeholder="Từ"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Đến"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={applyPriceFilter}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Áp dụng
        </button>
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thành phố
        </label>
        <div className="grid grid-cols-1 gap-2 mb-2">
          <input
            type="text"
            placeholder="Nhập tên thành phố"
            value={localCity}
            onChange={(e) => setLocalCity(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={applyLocationFilter}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Áp dụng
        </button>
      </div>

      {/* Adoption Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại giao dịch
        </label>
        <select
          value={filters.isForAdoption}
          onChange={(e) => handleFilterChange("isForAdoption", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả</option>
          <option value="true">Nhận nuôi</option>
          <option value="false">Mua bán</option>
        </select>
      </div>

      {/* Quick Filters */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Bộ lọc nhanh</h4>
        <div className="space-y-2">
          <button
            onClick={() => handleFilterChange("isForAdoption", "true")}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
          >
            🏠 Thú cưng nhận nuôi
          </button>
          <button
            onClick={() => handleFilterChange("species", "dog")}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
          >
            🐕 Chó
          </button>
          <button
            onClick={() => handleFilterChange("species", "cat")}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
          >
            🐱 Mèo
          </button>
          <button
            onClick={() => {
              handleFilterChange("maxPrice", "5000000");
              handleFilterChange("isForAdoption", "false");
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
          >
            💰 Dưới 5 triệu
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetFilters;
