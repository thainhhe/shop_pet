"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { orderAPI } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import { Modal } from "antd";
import CheckPayment from "./CheckPayment";

const CheckoutPage = () => {
  const {
    cart,
    loading: cartLoading,
    error: cartError,
    fetchCart,
    clearSelectedItems,
  } = useCart();
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
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [paymentCheckText, setPaymentCheckText] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=checkout");
      return;
    }

    fetchCart();
  }, [isAuthenticated, fetchCart, navigate]);

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

  const getItemImage = (item) => {
    if (item.itemType === "product") {
      return (
        item.item.images?.[0]?.url || "/placeholder.svg?height=48&width=48"
      );
    } else if (item.itemType === "pet") {
      return (
        item.item.images?.[0]?.url || "/placeholder.svg?height=48&width=48"
      );
    }
    return "/placeholder.svg?height=48&width=48";
  };

  const getItemName = (item) => {
    return item.item?.name || "Unknown Item";
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

    if (!["cod", "bank_transfer"].includes(paymentMethod)) {
      newErrors.paymentMethod = "Phương thức thanh toán không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateRandomText = (length) => {
    const allowedCharacters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      const randomChar = allowedCharacters.charAt(
        Math.floor(Math.random() * allowedCharacters.length)
      );
      result += randomChar;
    }
    return result;
  };

  const generateQRCodeUrl = (amount, message) => {
    return `https://img.vietqr.io/image/ICB-105883688517-compact2.png?amount=${amount}&addInfo=${message}`;
  };

  const readNumber = (number) => {
    const unitTexts = [
      "",
      "một",
      "hai",
      "ba",
      "bốn",
      "năm",
      "sáu",
      "bảy",
      "tám",
      "chín",
    ];
    const hundredsTexts = [
      "",
      "nghìn",
      "triệu",
      "tỷ",
      "nghìn tỷ",
      "triệu tỷ",
      "tỷ ty",
    ];

    const read3Number = (num, checkNumber = false) => {
      const absNumber = Math.abs(num);
      const hundreds = Math.floor(absNumber / 100);
      const remainder = absNumber % 100;
      const tens = Math.floor(remainder / 10);
      const units = remainder % 10;

      let result = "";

      if (hundreds > 0) {
        result += unitTexts[hundreds] + " trăm ";
      } else if (checkNumber && (tens > 0 || units > 0)) {
        result += "không trăm ";
      }

      if (tens > 1) {
        result += unitTexts[tens] + " mươi ";
      } else if (tens === 1) {
        result += "mười ";
      } else if (checkNumber && units > 0) {
        result += "lẻ ";
      }

      if (tens > 1 && units === 1) {
        result += "mốt";
      } else if (tens > 0 && units === 5) {
        result += "lăm";
      } else if (units > 0) {
        result += unitTexts[units];
      }
      return result.trim();
    };

    let result = "";
    let index = 0;
    let absNumber = Math.abs(number);
    const lastIndex = Math.floor(String(absNumber).length / 3);

    if (!absNumber) return "Không đồng";

    do {
      const hashScale = index !== lastIndex;
      const threeDigits = read3Number(absNumber % 1000, hashScale);

      if (threeDigits) {
        result = `${threeDigits} ${hundredsTexts[index]} ${result}`;
      }

      absNumber = Math.floor(absNumber / 1000);
      index++;
    } while (absNumber > 0);

    return result.trim() + " đồng";
  };

  const handleQRCodePayment = async () => {
    try {
      // Create order first
      const response = await orderAPI.createOrder({
        ...formData,
        paymentStatus: "pending",
      });
      setOrderId(response.data.order._id);
      setTotalAmount(cart.totalAmount);
      const randomText = generateRandomText(10);
      setPaymentCheckText(randomText);
      setQrCodeValue(generateQRCodeUrl(cart.totalAmount, randomText));
      setShowQRCode(true);
    } catch (error) {
      console.error("Error creating order for QR payment:", error);
      setOrderError(
        error.response?.data?.message || "Đã xảy ra lỗi khi tạo đơn hàng"
      );
      setIsSubmitting(false);
    }
  };

  const handleOrderPlacement = async () => {
    try {
      // Update payment status to "paid"
      await orderAPI.updatePaymentStatus(orderId, "paid");

      // Remove selected items from cart
      const selectedItems = cart.items.map((item) => item.item._id.toString());
      const response = await clearSelectedItems(selectedItems);
      if (!response.success) {
        throw new Error(response.error);
      }

      setShowQRCode(false);
      navigate(`/orders/${orderId}?success=true`);
    } catch (error) {
      console.error("Error placing order:", error);
      setOrderError("Có lỗi xảy ra trong quá trình hoàn tất đơn hàng.");
    }
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setOrderError(null);

    const textToRead = readNumber(cart.totalAmount);
    const utterance = new SpeechSynthesisUtterance(
      `Số tiền cần thanh toán là: ${textToRead}`
    );
    utterance.lang = "vi-VN";
    window.speechSynthesis.speak(utterance);

    if (formData.paymentMethod === "bank_transfer") {
      await handleQRCodePayment();
    } else {
      try {
        const response = await orderAPI.createOrder(formData);
        const selectedItems = cart.items.map((item) =>
          item.item._id.toString()
        );
        const clearResponse = await clearSelectedItems(selectedItems);
        if (!clearResponse.success) {
          throw new Error(clearResponse.error);
        }
        navigate(`/orders/${response.data.order._id}?success=true`);
      } catch (error) {
        console.error("Checkout error:", error);
        setOrderError(
          error.response?.data?.message || "Đã xảy ra lỗi khi tạo đơn hàng"
        );
      }
    }
    setIsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleCheckout();
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
                        src={getItemImage(item)}
                        alt={getItemName(item)}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getItemName(item)}
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

        {/* QR Code Modal */}
        <Modal
          visible={showQRCode}
          onCancel={() => setShowQRCode(false)}
          footer={null}
          maskClosable={false}
          closable={true}
        >
          <h6 style={{ textAlign: "center" }}>
            Vui lòng chuyển khoản đúng số tiền. Mọi lỗi về chuyển thiếu hoặc
            thừa chúng tôi không hỗ trợ.
          </h6>
          <img
            src={qrCodeValue}
            alt="QR Code"
            style={{ maxWidth: "100%", margin: "auto", display: "block" }}
          />
          <p style={{ textAlign: "center" }}>
            <strong>Quét mã để thanh toán</strong>
          </p>
          <CheckPayment
            totalMoney={totalAmount}
            txt={paymentCheckText}
            onPaymentSuccess={handleOrderPlacement}
          />
        </Modal>
      </div>
    </div>
  );
};

export default CheckoutPage;
