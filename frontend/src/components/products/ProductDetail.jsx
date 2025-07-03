import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";
import { useCart } from "../../contexts/CartContext";

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const { addToCart } = useCart();

    useEffect(() => {
        fetchProductDetail();
        // eslint-disable-next-line
    }, [id]);

    const fetchProductDetail = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getProduct(id);
            if (!response.data?.product) {
                throw new Error("Dữ liệu sản phẩm không hợp lệ");
            }
            setProduct(response.data.product);
        } catch (err) {
            setError(
                err.response?.data?.message || "Không thể tải thông tin sản phẩm"
            );
            console.error("Fetch product detail error:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const calculateDiscountedPrice = () => {
        if (product.discount?.percentage > 0 && new Date(product.discount.validUntil) > new Date()) {
            return product.price * (1 - product.discount.percentage / 100);
        }
        return product.price;
    };

    const isOnSale = product && product.discount?.percentage > 0 && new Date(product.discount.validUntil) > new Date();

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        try {
            const result = await addToCart(product._id, 1, "product");
            if (result.success) {
                alert("Đã thêm vào giỏ hàng thành công!");
            } else {
                alert(result.error || "Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Add to cart error:", error);
            alert("Lỗi: Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
        }
    };

    // Thêm hàm xử lý liên hệ và mua ngay
    const handleContactShop = () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        alert("Tính năng nhắn tin cho shop sẽ được phát triển sau!");
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        // Thêm vào giỏ hàng và chuyển sang trang checkout
        try {
            const result = await addToCart(product._id, 1, "product");
            if (result.success) {
                navigate("/checkout");
            } else {
                alert(result.error || "Không thể mua ngay. Vui lòng thử lại!");
            }
        } catch (error) {
            alert("Lỗi: Không thể mua ngay. Vui lòng thử lại!");
        }
    };

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="text-red-600 mb-4">{error}</div>
                    <button
                        onClick={() => navigate("/products")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate("/products")}
                className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
            >
                <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                Quay lại danh sách
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Images */}
                <div>
                    <div className="relative mb-4">
                        <img
                            src={
                                product.images?.[currentImageIndex]?.url ||
                                "/placeholder.svg?height=400&width=600"
                            }
                            alt={product.name}
                            className="w-full h-96 object-cover rounded-lg"
                            loading="lazy"
                        />
                        {product.images && product.images.length > 1 && (
                            <>
                                <button
                                    onClick={() =>
                                        setCurrentImageIndex((prev) =>
                                            prev > 0 ? prev - 1 : product.images.length - 1
                                        )
                                    }
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
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
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                                <button
                                    onClick={() =>
                                        setCurrentImageIndex((prev) =>
                                            prev < product.images.length - 1 ? prev + 1 : 0
                                        )
                                    }
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
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
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>

                    {product.images && product.images.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${index === currentImageIndex
                                        ? "border-blue-500"
                                        : "border-gray-200"
                                        }`}
                                >
                                    <img
                                        src={image.url || "/placeholder.svg"}
                                        alt={`${product.name} ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Information */}
                <div>
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                            {isOnSale && (
                                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                    -{product.discount.percentage}%
                                </span>
                            )}
                        </div>

                        <div className="text-2xl font-bold text-blue-600 mb-4">
                            {isOnSale ? (
                                <>
                                    {formatPrice(calculateDiscountedPrice())}
                                    <span className="text-base text-gray-500 line-through ml-2">
                                        {formatPrice(product.price)}
                                    </span>
                                </>
                            ) : (
                                formatPrice(product.price)
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <span className="text-sm text-gray-500">Loại:</span>
                                <p className="font-medium">{product.category}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Thương hiệu:</span>
                                <p className="font-medium">{product.brand || "Không rõ"}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Tồn kho:</span>
                                <p className="font-medium">{product.inventory?.quantity} sản phẩm</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Đánh giá:</span>
                                <p className="font-medium">
                                    {product.ratings?.average?.toFixed(1) || 0} / 5 ({product.ratings?.count || 0} đánh giá)
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Mô tả</h3>
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        </div>

                        {/* Pet Types */}
                        {product.petTypes && product.petTypes.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Dành cho</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.petTypes.map((petType, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                                        >
                                            {petType === "all" ? "Tất cả" : petType}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Thông tin shop */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Thông tin cửa hàng</h3>
                            <div className="flex items-center bg-gray-50 p-4 rounded-lg">
                                <img
                                    src={product.shop?.avatar || "/placeholder.svg?height=40&width=40"}
                                    alt={product.shop?.name}
                                    className="w-10 h-10 rounded-full mr-3"
                                />
                                <div>
                                    <p className="font-medium">{product.shop?.name}</p>
                                    <p className="text-sm text-gray-500">{product.shop?.email}</p>
                                </div>
                            </div>
                        </div>
                        {/* Thông số kỹ thuật */}
                        {product.specifications && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Thông số kỹ thuật</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {product.specifications.weight && (
                                        <div><span className="font-medium">Khối lượng:</span> {product.specifications.weight}</div>
                                    )}
                                    {product.specifications.dimensions && (
                                        <div><span className="font-medium">Kích thước:</span> {product.specifications.dimensions}</div>
                                    )}
                                    {product.specifications.material && (
                                        <div><span className="font-medium">Chất liệu:</span> {product.specifications.material}</div>
                                    )}
                                    {product.specifications.ageRange && (
                                        <div><span className="font-medium">Độ tuổi phù hợp:</span> {product.specifications.ageRange}</div>
                                    )}
                                    {product.specifications.ingredients && (
                                        <div className="col-span-2"><span className="font-medium">Thành phần:</span> {product.specifications.ingredients}</div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Đánh giá sản phẩm */}
                        {product.reviews && product.reviews.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Đánh giá sản phẩm</h3>
                                <div className="space-y-4">
                                    {product.reviews.map((review, idx) => (
                                        <div key={idx} className="bg-gray-100 p-3 rounded">
                                            <div className="flex items-center mb-1">
                                                <span className="font-medium mr-2">{review.user?.name || "Người dùng ẩn danh"}</span>
                                                <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                            </div>
                                            <div className="text-sm text-gray-700">{review.comment}</div>
                                            <div className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                disabled={product.inventory?.quantity === 0}
                            >
                                {product.inventory?.quantity === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                    disabled={product.inventory?.quantity === 0}
                                >
                                    Mua ngay
                                </button>
                                <button
                                    onClick={handleContactShop}
                                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Nhắn cho người bán
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail; 