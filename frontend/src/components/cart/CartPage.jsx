"use client";

import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

const CartPage = () => {
  const { cart, loading, error, updateCartItem, removeFromCart, fetchCart } =
    useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    // Fetch cart data khi component mount và khi isAuthenticated thay đổi
    fetchCart();
  }, [isAuthenticated, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getItemImage = (item) => {
    if (item.itemType === "product") {
      return item.item.images?.[0]?.url || "/placeholder.svg?height=80&width=80";
    } else if (item.itemType === "pet") {
      return item.item.images?.[0]?.url || "/placeholder.svg?height=80&width=80";
    }
    return "/placeholder.svg?height=80&width=80";
  };

  const getItemName = (item) => {
    return item.item.name;
  };

  const getItemInventory = (item) => {
    if (item.itemType === "product") {
      return item.item.inventory?.quantity || 0;
    }
    return 1; // For pets, always return 1 as they can't be added more than once
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId) => {
    if (
      window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")
    ) {
      await removeFromCart(itemId);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
          <Link to="/products" className="text-blue-600 hover:text-blue-800">
            ← Tiếp tục mua sắm
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Giỏ hàng trống
            </h3>
            <p className="text-gray-500 mb-6">
              Hãy thêm một số sản phẩm vào giỏ hàng của bạn
            </p>
            <Link
              to="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">
                    Sản phẩm ({cart.totalItems})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <div key={item._id} className="p-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={getItemImage(item)}
                          alt={getItemName(item)}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {getItemName(item)}
                          </h3>
                          {item.itemType === "product" && (
                            <p className="text-sm text-gray-500">
                              Còn lại: {getItemInventory(item)} sản phẩm
                            </p>
                          )}
                          <p className="text-lg font-semibold text-blue-600 mt-1">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          {item.itemType === "product" ? (
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item._id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                                className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                -
                              </button>
                              <span className="px-4 py-1 border-x border-gray-300">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item._id,
                                    item.quantity + 1
                                  )
                                }
                                disabled={
                                  item.quantity >= getItemInventory(item)
                                }
                                className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Số lượng: 1</span>
                          )}
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Xóa sản phẩm"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 text-right">
                        <span className="text-lg font-semibold">
                          Tổng: {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(cart.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-600">
                        {formatPrice(cart.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors mt-6 block text-center font-semibold"
                >
                  Tiến hành thanh toán
                </Link>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Phí vận chuyển và thuế sẽ được tính khi thanh toán
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
