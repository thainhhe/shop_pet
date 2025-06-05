"use client";

import { useState, useEffect } from "react";
import { productsAPI } from "../../services/api";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import LoadingSpinner from "../common/LoadingSpinner";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: "",
    petTypes: "",
    minPrice: "",
    maxPrice: "",
    brand: "",
    search: "",
    sort: "newest",
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Remove empty filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );

      const response = await productsAPI.getProducts(cleanFilters);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (err) {
      setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại.");
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({
      ...filters,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    });
  };

  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage,
    });
  };

  const handleSearch = (searchTerm) => {
    setFilters({
      ...filters,
      search: searchTerm,
      page: 1,
    });
  };

  if (loading && products.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Sản phẩm thú cưng
        </h1>
        <p className="text-gray-600">
          Khám phá các sản phẩm chất lượng cho thú cưng của bạn
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <ProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
          />
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {pagination.total ? (
                <>
                  Hiển thị {products.length} trong tổng số {pagination.total}{" "}
                  sản phẩm
                </>
              ) : (
                "Không tìm thấy sản phẩm nào"
              )}
            </p>

            <div className="flex items-center space-x-2">
              <label htmlFor="sort" className="text-sm text-gray-600">
                Sắp xếp:
              </label>
              <select
                id="sort"
                value={filters.sort}
                onChange={(e) => handleFilterChange({ sort: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_low">Giá thấp đến cao</option>
                <option value="price_high">Giá cao đến thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="popular">Phổ biến nhất</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.current - 1)}
                      disabled={pagination.current === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>

                    {[...Array(pagination.pages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            page === pagination.current
                              ? "bg-blue-600 text-white"
                              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(pagination.current + 1)}
                      disabled={pagination.current === pagination.pages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy sản phẩm nào
              </h3>
              <p className="text-gray-500 mb-4">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <button
                onClick={() =>
                  setFilters({
                    page: 1,
                    limit: 12,
                    category: "",
                    petTypes: "",
                    minPrice: "",
                    maxPrice: "",
                    brand: "",
                    search: "",
                    sort: "newest",
                  })
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
