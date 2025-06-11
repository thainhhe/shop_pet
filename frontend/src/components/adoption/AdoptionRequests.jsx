"use client";

import { useState, useEffect } from "react";
import { useAdoption } from "../../contexts/AdoptionContext";
import LoadingSpinner from "../common/LoadingSpinner";

const AdoptionRequests = () => {
  const { getAdoptionRequests, updateAdoptionStatus } = useAdoption();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const result = await getAdoptionRequests({
        page: currentPage,
        limit: 5,
        status: statusFilter,
      });

      if (result.success) {
        setRequests(result.applications);
        setTotalPages(result.pagination?.pages || 1);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Không thể tải danh sách đơn nhận nuôi");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus, notes = "") => {
    try {
      const result = await updateAdoptionStatus(
        applicationId,
        newStatus,
        notes
      );

      if (result.success) {
        // Refresh the list
        fetchRequests();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Không thể cập nhật trạng thái đơn nhận nuôi");
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    const statusLabels = {
      pending: "Đang chờ xử lý",
      approved: "Đã chấp nhận",
      rejected: "Đã từ chối",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}
      >
        {statusLabels[status]}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Đơn đăng ký nhận nuôi</h2>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="pending">Đang chờ xử lý</option>
          <option value="approved">Đã chấp nhận</option>
          <option value="rejected">Đã từ chối</option>
          <option value="completed">Hoàn thành</option>
          <option value="all">Tất cả</option>
        </select>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có đơn nhận nuôi nào
          </h3>
          <p className="text-gray-500">
            Chưa có ai đăng ký nhận nuôi thú cưng của bạn.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-lg shadow p-6 border border-gray-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
                <div className="flex items-center mb-4 lg:mb-0">
                  <img
                    src={
                      request.pet.images?.[0]?.url ||
                      "/placeholder.svg?height=60&width=60"
                    }
                    alt={request.pet.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-medium text-lg">{request.pet.name}</h3>
                    <p className="text-sm text-gray-500">
                      {request.pet.breed} •{" "}
                      {request.pet.gender === "male" ? "Đực" : "Cái"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col lg:items-end">
                  <div className="mb-2">{getStatusBadge(request.status)}</div>
                  <p className="text-xs text-gray-500">
                    Ngày đăng ký: {formatDate(request.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium mb-2">Thông tin người đăng ký</h4>
                  <p className="text-sm">
                    <span className="font-medium">Tên:</span>{" "}
                    {request.applicant.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span>{" "}
                    {request.applicant.email}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Điện thoại:</span>{" "}
                    {request.applicant.phone}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Thông tin cơ bản</h4>
                  <p className="text-sm">
                    <span className="font-medium">Điều kiện sống:</span>{" "}
                    {request.livingArrangement}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Lịch làm việc:</span>{" "}
                    {request.workSchedule}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Có thú cưng khác:</span>{" "}
                    {request.hasOtherPets ? "Có" : "Không"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Có con nhỏ:</span>{" "}
                    {request.hasChildren ? "Có" : "Không"}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Lý do nhận nuôi</h4>
                <p className="text-sm text-gray-700">
                  {request.reasonForAdoption}
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Kinh nghiệm nuôi thú cưng</h4>
                <p className="text-sm text-gray-700">{request.experience}</p>
              </div>

              {request.reviewNotes && (
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <p className="text-sm font-medium">Ghi chú đánh giá</p>
                  <p className="text-sm">{request.reviewNotes}</p>
                </div>
              )}

              {request.status === "pending" && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() =>
                      handleStatusUpdate(
                        request._id,
                        "approved",
                        "Đơn của bạn đã được chấp nhận. Chúng tôi sẽ liên hệ để sắp xếp lịch gặp mặt."
                      )
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Chấp nhận
                  </button>

                  <button
                    onClick={() => {
                      const notes = prompt("Lý do từ chối (tùy chọn):");
                      handleStatusUpdate(
                        request._id,
                        "rejected",
                        notes || "Đơn của bạn không được chấp nhận."
                      );
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Từ chối
                  </button>

                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => {
                      /* View full details */
                    }}
                  >
                    Xem chi tiết
                  </button>
                </div>
              )}

              {request.status === "approved" && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() =>
                      handleStatusUpdate(
                        request._id,
                        "completed",
                        "Quá trình nhận nuôi đã hoàn tất thành công."
                      )
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Hoàn thành nhận nuôi
                  </button>

                  <button
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    onClick={() => {
                      /* Schedule meeting */
                    }}
                  >
                    Lên lịch gặp mặt
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
            >
              Trước
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
            >
              Sau
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AdoptionRequests;
