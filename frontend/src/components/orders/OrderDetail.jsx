"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { orderAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

const OrderDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const showSuccess = queryParams.get("success") === "true";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchOrder();
  }, [isAuthenticated, id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrder(id);
      setOrder(response.data.order);
    } catch (error) {
      console.error("Fetch order error:", error);
      setError(
        error.response?.data?.message || "Không thể tải thông tin đơn hàng"
      );
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

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipped":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ thanh toán";
      case "paid":
        return "Đã thanh toán";
      case "failed":
        return "Thanh toán thất bại";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "cod":
        return "Thanh toán khi nhận hàng (COD)";
      case "momo":
        return "MoMo";
      case "zalopay":
        return "ZaloPay";
      case "bank_transfer":
        return "Chuyển khoản ngân hàng";
      default:
        return method;
    }
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      alert("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }

    try {
      setIsCancelling(true);
      await orderAPI.cancelOrder(id, cancelReason);
      await fetchOrder();
      setShowCancelForm(false);
    } catch (error) {
      console.error("Cancel order error:", error);
      alert(error.response?.data?.message || "Không thể hủy đơn hàng");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/orders")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Quay lại danh sách đơn hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-6">
            Đơn hàng đã được tạo thành công!
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Đơn hàng #{order.orderNumber}
            <span
              className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusText(order.status)}
            </span>
          </h1>
          <button
            onClick={() => navigate("/orders")}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Quay lại danh sách
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Thông tin đơn hàng</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Thông tin chung
                </h3>
                <p className="mb-1">
                  <span className="font-medium">Ngày đặt hàng:</span>{" "}
                  {formatDate(order.createdAt)}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Trạng thái:</span>{" "}
                  {getStatusText(order.status)}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Thanh toán:</span>{" "}
                  {getPaymentStatusText(order.paymentStatus)}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Phương thức:</span>{" "}
                  {getPaymentMethodText(order.paymentMethod)}
                </p>
                {order.estimatedDelivery && (
                  <p className="mb-1">
                    <span className="font-medium">Dự kiến giao hàng:</span>{" "}
                    {formatDate(order.estimatedDelivery)}
                  </p>
                )}
                {order.notes && (
                  <p className="mb-1">
                    <span className="font-medium">Ghi chú:</span> {order.notes}
                  </p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Địa chỉ giao hàng
                </h3>
                <p className="mb-1 font-medium">{order.shippingAddress.name}</p>
                <p className="mb-1">{order.shippingAddress.phone}</p>
                <p className="mb-1">{order.shippingAddress.address}</p>
                <p className="mb-1">
                  {order.shippingAddress.ward &&
                    `${order.shippingAddress.ward}, `}
                  {order.shippingAddress.district}, {order.shippingAddress.city}
                  {order.shippingAddress.zipCode &&
                    `, ${order.shippingAddress.zipCode}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Sản phẩm</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {order.items.map((item) => (
              <div key={item._id} className="p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image || "/placeholder.svg?height=80&width=80"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Số lượng: {item.quantity}
                    </p>
                    <p className="text-lg font-semibold text-blue-600 mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Tổng cộng:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {["pending", "confirmed"].includes(order.status) && (
          <div className="mt-6">
            {showCancelForm ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium mb-4">Hủy đơn hàng</h3>
                <form onSubmit={handleCancelOrder}>
                  <div className="mb-4">
                    <label
                      htmlFor="cancelReason"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Lý do hủy đơn <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="cancelReason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Vui lòng cho biết lý do bạn muốn hủy đơn hàng này"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={isCancelling}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-70"
                    >
                      {isCancelling ? "Đang xử lý..." : "Xác nhận hủy đơn"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCancelForm(false)}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowCancelForm(true)}
                className="bg-white border border-red-600 text-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition-colors"
              >
                Hủy đơn hàng
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
