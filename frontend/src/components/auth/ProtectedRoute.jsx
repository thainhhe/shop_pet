"use client";

import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import { useState, useEffect } from "react";

const ErrorMessage = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Tăng thời gian hiển thị lên 5 giây

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50"></div>
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4 relative">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">Lỗi truy cập</h3>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-red-500 h-1 rounded-full animate-[shrink_5s_linear]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Accept both string or array for role checking
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    // Kiểm tra role không được phép
    if (!allowedRoles.includes(user?.role)) {
      if (!showError) {
        setErrorMessage("Bạn không có quyền truy cập trang này!");
        setShowError(true);
        // Đặt timeout để chuyển hướng sau khi hiển thị thông báo
        setTimeout(() => {
          setShouldRedirect(true);
        }, 3500); // Giảm thời gian chờ xuống 4.5 giây để đảm bảo thông báo biến mất trước khi chuyển trang
      }

      if (shouldRedirect) {
        // Nếu là shop nhưng không có quyền, chuyển về shop dashboard
        if (user?.role === "shop_owner") {
          return <Navigate to="/shop-dashboard" replace />;
        }
        if (user?.role === "rescue_center") {
          return <Navigate to="/rescue-dashboard" replace />;
        }
        if (user?.role === "admin") {
          return <Navigate to="/admin-dashboard" replace />;
        }
        // Các trường hợp khác chuyển về trang chủ
        return <Navigate to="/" replace />;
      }
    }
  }

  return (
    <>
      {showError && <ErrorMessage message={errorMessage} onClose={() => setShowError(false)} />}
      {children}
    </>
  );
};

export default ProtectedRoute;
