"use client";

import { useState, useEffect } from "react";
import { useAdoption } from "../../contexts/AdoptionContext";
import LoadingSpinner from "../common/LoadingSpinner";

const AdoptionApplications = () => {
  const { getMyApplications } = useAdoption();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchApplications();
  }, [currentPage]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const result = await getMyApplications({ page: currentPage, limit: 5 });

      if (result.success) {
        setApplications(result.applications);
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

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có đơn nhận nuôi nào
        </h3>
        <p className="text-gray-500">
          Bạn chưa gửi đơn đăng ký nhận nuôi thú cưng nào.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Đơn đăng ký nhận nuôi của bạn</h2>

      <div className="space-y-4">
        {applications.map((application) => (
          <div
            key={application._id}
            className="bg-white rounded-lg shadow p-4 border border-gray-200"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div className="flex items-center mb-2 md:mb-0">
                <img
                  src={
                    application.pet.images?.[0]?.url ||
                    "/placeholder.svg?height=60&width=60"
                  }
                  alt={application.pet.name}
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
                <div>
                  <h3 className="font-medium">{application.pet.name}</h3>
                  <p className="text-sm text-gray-500">
                    {application.pet.breed} •{" "}
                    {application.pet.gender === "male" ? "Đực" : "Cái"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:items-end">
                <div className="mb-1">{getStatusBadge(application.status)}</div>
                <p className="text-xs text-gray-500">
                  Ngày đăng ký: {formatDate(application.createdAt)}
                </p>
              </div>
            </div>

            {application.meetingSchedule?.date && (
              <div className="bg-blue-50 p-3 rounded-md mb-3">
                <p className="text-sm font-medium">Lịch hẹn gặp mặt</p>
                <p className="text-sm">
                  <span className="font-medium">Ngày:</span>{" "}
                  {formatDate(application.meetingSchedule.date)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Địa điểm:</span>{" "}
                  {application.meetingSchedule.location}
                </p>
                {application.meetingSchedule.notes && (
                  <p className="text-sm">
                    <span className="font-medium">Ghi chú:</span>{" "}
                    {application.meetingSchedule.notes}
                  </p>
                )}
              </div>
            )}

            {application.reviewNotes && (
              <div className="bg-gray-50 p-3 rounded-md mb-3">
                <p className="text-sm font-medium">Phản hồi từ chủ sở hữu</p>
                <p className="text-sm">{application.reviewNotes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-3">
              <button
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => {
                  /* View details */
                }}
              >
                Xem chi tiết
              </button>

              {application.status === "pending" && (
                <button
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                  onClick={() => {
                    /* Cancel application */
                  }}
                >
                  Hủy đơn
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

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

export default AdoptionApplications;
