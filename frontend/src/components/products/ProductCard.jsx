import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: "🍖",
      toy: "🎾",
      accessory: "🎀",
      health: "💊",
      grooming: "🧴",
      housing: "🏠",
    };
    return icons[category] || "📦";
  };

  const getCategoryLabel = (category) => {
    const labels = {
      food: "Thức ăn",
      toy: "Đồ chơi",
      accessory: "Phụ kiện",
      health: "Sức khỏe",
      grooming: "Chăm sóc",
      housing: "Nhà ở",
    };
    return labels[category] || category;
  };

  const calculateDiscountedPrice = () => {
    if (product.discount?.percentage > 0) {
      return product.price * (1 - product.discount.percentage / 100);
    }
    return product.price;
  };

  const isOnSale =
    product.discount?.percentage > 0 &&
    new Date(product.discount.validUntil) > new Date();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={
            product.images?.[0]?.url || "/placeholder.svg?height=200&width=300"
          }
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-white px-2 py-1 rounded-full text-sm font-medium">
            {getCategoryIcon(product.category)}{" "}
            {getCategoryLabel(product.category)}
          </span>
        </div>
        {isOnSale && (
          <div className="absolute top-2 right-2">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              -{product.discount.percentage}%
            </span>
          </div>
        )}
        {product.inventory.quantity <= product.inventory.lowStockThreshold && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Sắp hết hàng
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {product.name}
          </h3>
          {product.brand && (
            <p className="text-sm text-gray-500">{product.brand}</p>
          )}
        </div>

        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Pet Types */}
        {product.petTypes && product.petTypes.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {product.petTypes.slice(0, 3).map((petType, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                >
                  {petType === "all" ? "Tất cả" : petType}
                </span>
              ))}
              {product.petTypes.length > 3 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  +{product.petTypes.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Rating */}
        {product.ratings.count > 0 && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.ratings.average)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {product.ratings.average.toFixed(1)} ({product.ratings.count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            {isOnSale ? (
              <div>
                <div className="text-lg font-bold text-red-600">
                  {formatPrice(calculateDiscountedPrice())}
                </div>
                <div className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </div>
              </div>
            ) : (
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          <Link
            to={`/products/${product._id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Xem chi tiết
          </Link>
        </div>

        {/* Stock Status */}
        <div className="mt-2">
          <div className="text-xs text-gray-500">
            Còn lại: {product.inventory.quantity} sản phẩm
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
