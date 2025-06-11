"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { orderAPI } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

const CheckoutPage = () => {
  const { cart, loading: cartLoading, error: cartError, fetchCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    shippingAddress: {
      name: user?.name || "",
      phone: user?.phone || "",
      address: "",
      city: "",
      district: "",
      ward: "",
      zipCode: "",
    },
    paymentMethod: "cod",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=checkout");
      return;
    }

    fetchCart();
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          name: user.name || prev.shippingAddress.name,
          phone: user.phone || prev.shippingAddress.phone,
        },
      }));
    }
  }, [user]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { shippingAddress, paymentMethod } = formData;

    // Validate shipping address
    if (!shippingAddress.name)
      newErrors["shippingAddress.name"] = "Họ tên là bắt buộc";
    if (!shippingAddress.phone)
      newErrors["shippingAddress.phone"] = "Số điện thoại là bắt buộc";
    if (!shippingAddress.address)
      newErrors["shippingAddress.address"] = "Địa chỉ là bắt buộc";
    if (!shippingAddress.city)
      newErrors["shippingAddress.city"] = "Thành phố là bắt buộc";
    if (!shippingAddress.district)
      newErrors["shippingAddress.district"] = "Quận/Huyện là bắt buộc";

    // Validate payment method
    if (!["cod", "momo", "zalopay", "bank_transfer"].includes(paymentMethod)) {
      newErrors.paymentMethod = "Phương thức thanh toán không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setOrderError(null);

    try {
      const response = await orderAPI.createOrder(formData);
      navigate(`/orders/${response.data.order._id}?success=true`);
    } catch (error) {
      console.error("Checkout error:", error);
      setOrderError(
        error.response?.data?.message || "Đã xảy ra lỗi khi tạo đơn hàng"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading) return <LoadingSpinner />;

  if (!isAuthenticated) return null;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Giỏ hàng trống
          </h3>
          <p className="text-gray-500 mb-6">
            Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Khám phá sản phẩm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <button
            onClick={() => navigate("/cart")}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Quay lại giỏ hàng
          </button>
        </div>

        {cartError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {cartError}
          </div>
        )}
        {orderError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {orderError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Thông tin giao hàng</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Họ tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="shippingAddress.name"
                      value={formData.shippingAddress.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        errors["shippingAddress.name"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors["shippingAddress.name"] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors["shippingAddress.name"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="shippingAddress.phone"
                      value={formData.shippingAddress.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        errors["shippingAddress.phone"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors["shippingAddress.phone"] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors["shippingAddress.phone"]}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="shippingAddress.address"
                    value={formData.shippingAddress.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors["shippingAddress.address"]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors["shippingAddress.address"] && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors["shippingAddress.address"]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Thành phố <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="shippingAddress.city"
                      value={formData.shippingAddress.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        errors["shippingAddress.city"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors["shippingAddress.city"] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors["shippingAddress.city"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="district"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="district"
                      name="shippingAddress.district"
                      value={formData.shippingAddress.district}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        errors["shippingAddress.district"]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors["shippingAddress.district"] && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors["shippingAddress.district"]}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="ward"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phường/Xã
                    </label>
                    <input
                      type="text"
                      id="ward"
                      name="shippingAddress.ward"
                      value={formData.shippingAddress.ward}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mã bưu điện
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="shippingAddress.zipCode"
                    value={formData.shippingAddress.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Phương thức thanh toán{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="cod"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        htmlFor="cod"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        Thanh toán khi nhận hàng (COD)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="momo"
                        name="paymentMethod"
                        value="momo"
                        checked={formData.paymentMethod === "momo"}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        htmlFor="momo"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        MoMo
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="zalopay"
                        name="paymentMethod"
                        value="zalopay"
                        checked={formData.paymentMethod === "zalopay"}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        htmlFor="zalopay"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        ZaloPay
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="bank_transfer"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={formData.paymentMethod === "bank_transfer"}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        htmlFor="bank_transfer"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        Chuyển khoản ngân hàng
                      </label>
                    </div>
                  </div>
                  {errors.paymentMethod && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.paymentMethod}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Ghi chú
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Đang xử lý..." : "Hoàn tất đơn hàng"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Đơn hàng của bạn</h2>
              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div
                    key={item._id}
                    className="py-3 flex items-center space-x-4"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={
                          item.product.images?.[0]?.url ||
                          "/placeholder.svg?height=48&width=48"
                        }
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        SL: {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
