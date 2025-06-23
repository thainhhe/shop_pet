"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";
import api from "../../services/api";

const PetManagement = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const { token } = useAuth();

  useEffect(() => {
    fetchMyPets();
  }, [token]);

  const fetchMyPets = async () => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await api.get("/shop/pets", config);
      setPets(response.data);
    } catch (err) {
      setError("Không thể tải danh sách thú cưng");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (petId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thú cưng này?")) {
      try {
        await petsAPI.deletePet(petId);
        setPets(pets.filter((pet) => pet._id !== petId));
      } catch (err) {
        alert("Không thể xóa thú cưng");
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      adopted: "bg-blue-100 text-blue-800",
      sold: "bg-gray-100 text-gray-800",
    };
    const labels = {
      available: "Có sẵn",
      pending: "Đang chờ",
      adopted: "Đã nhận nuôi",
      sold: "Đã bán",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý thú cưng
          </h1>
          <p className="text-gray-600">Quản lý danh sách thú cưng của bạn</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchMyPets}
            loading={loading}
          >
            Làm mới
          </Button>
          <Link to="/pets/new">
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm thú cưng mới
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Date Filter Controls */}
      <Card size="small" className="shadow-sm mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarOutlined className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Lọc theo thời gian:
            </span>
          </div>

          <Select
            value={dateFilterType}
            onChange={(value) => handleDateFilterChange(value, null)}
            style={{ width: 120 }}
          >
            <Option value="month">Theo tháng</Option>
            <Option value="range">Khoảng thời gian</Option>
          </Select>

          {dateFilterType === "month" ? (
            <MonthPicker
              value={selectedMonth}
              onChange={(value) => handleDateFilterChange("month", value)}
              placeholder="Chọn tháng"
              format="MM/YYYY"
              style={{ width: 150 }}
            />
          ) : (
            <RangePicker
              value={dateRange}
              onChange={(value) => handleDateFilterChange("range", value)}
              placeholder={["Từ ngày", "Đến ngày"]}
              format="DD/MM/YYYY"
              style={{ width: 250 }}
            />
          )}
        </div>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số thú cưng"
              value={stats.total}
              prefix={<HeartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Có sẵn"
              value={stats.available}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang chờ"
              value={stats.pending}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã nhận nuôi"
              value={stats.adopted}
              valueStyle={{ color: "#1890ff" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Pet List */}
      {filteredPets.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có thú cưng nào
          </h3>
          <p className="text-gray-500 mb-4">
            Bắt đầu bằng cách thêm thú cưng đầu tiên của bạn
          </p>
          <Link to="/pets/new">
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm thú cưng mới
            </Button>
          </Link>
        </Card>
      ) : (
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>Danh sách thú cưng ({stats.total})</span>
              <div className="flex items-center space-x-2">
                <FilterOutlined className="text-gray-500" />
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="available">Có sẵn</Option>
                  <Option value="pending">Đang chờ</Option>
                  <Option value="adopted">Đã nhận nuôi</Option>
                </Select>
              </div>
            </div>
          }
          className="shadow-md"
        >
          <Table
            columns={columns}
            dataSource={filteredPets}
            rowKey="_id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredPets.length,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} thú cưng`,
              pageSizeOptions: ["10", "20", "50"],
              size: "small",
            }}
            loading={loading}
            size="small"
          />
        </Card>
      )}
    </div>
  );
};

export default PetManagement;
