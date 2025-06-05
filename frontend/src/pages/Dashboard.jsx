"use client";

import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  const getRoleLabel = (role) => {
    const labels = {
      user: "Người dùng",
      shop_owner: "Chủ cửa hàng",
      rescue_center: "Trung tâm cứu hộ",
      admin: "Quản trị viên",
    };
    return labels[role] || role;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Chào mừng trở lại, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Thông tin tài khoản</h3>
          <div className="space-y-2">
            <p>
              <span className="text-gray-500">Tên:</span> {user?.name}
            </p>
            <p>
              <span className="text-gray-500">Email:</span> {user?.email}
            </p>
            <p>
              <span className="text-gray-500">Vai trò:</span>{" "}
              {getRoleLabel(user?.role)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Thống kê</h3>
          <div className="space-y-2">
            <p>
              <span className="text-gray-500">Thú cưng đã xem:</span> 0
            </p>
            <p>
              <span className="text-gray-500">Yêu thích:</span> 0
            </p>
            <p>
              <span className="text-gray-500">Đơn hàng:</span> 0
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Hoạt động gần đây</h3>
          <p className="text-gray-500">Chưa có hoạt động nào</p>
        </div>
      </div>

      {/* Role-specific content */}
      {user?.role === "shop_owner" && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Quản lý cửa hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Thêm thú cưng mới
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Quản lý đơn hàng
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
              Thống kê bán hàng
            </button>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700">
              Quảng cáo
            </button>
          </div>
        </div>
      )}

      {user?.role === "rescue_center" && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">
            Quản lý trung tâm cứu hộ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Thêm thú cưng cần nhận nuôi
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Quản lý đơn nhận nuôi
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
              Thống kê nhận nuôi
            </button>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700">
              Chiến dịch cứu hộ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
