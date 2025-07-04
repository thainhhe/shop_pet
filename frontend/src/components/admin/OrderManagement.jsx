import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  message,
  Input,
  Tabs,
  Space,
  Modal,
  Select,
} from "antd";
import { adminAPI } from "../../services/api";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "./OrderManagement.css";

const { Option } = Select;
const { TabPane } = Tabs;

// Floating label search input component
const SearchFloatingLabel = ({
  value,
  onChange,
  onSearch,
  placeholder,
  label,
  icon,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") onSearch && onSearch(e.target.value);
  };
  return (
    <div className="form__group_one" style={{ width: 280, marginRight: 8 }}>
      <input
        type="text"
        className="form__group_oneform__field w-100"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <label className="form__group_oneform__label">
        {icon} {label}
      </label>
    </div>
  );
};

export const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang chuẩn bị",
  shipped: "Đã gửi đi",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export const statusColors = {
  pending: "default",
  confirmed: "blue",
  processing: "orange",
  shipped: "purple",
  delivered: "green",
  cancelled: "red",
};

export const statusIcons = {
  pending: <ClockCircleOutlined />,
  confirmed: <CheckCircleOutlined />,
  processing: <EditOutlined />,
  shipped: <CarOutlined />,
  delivered: <CheckOutlined />,
  cancelled: <CloseCircleOutlined />,
};

// Thêm payment status labels và colors
const paymentStatusLabels = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
  refunded: "Đã hoàn tiền",
};

const paymentStatusColors = {
  pending: "default",
  paid: "green",
  failed: "red",
  refunded: "orange",
};

const paymentStatusIcons = {
  pending: <ClockCircleOutlined />,
  paid: <CheckCircleOutlined />,
  failed: <CloseCircleOutlined />,
  refunded: <EditOutlined />,
};

// Định nghĩa workflow cho việc chuyển trạng thái
export const statusWorkflow = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [], // Không thể chuyển từ delivered
  cancelled: [], // Không thể chuyển từ cancelled
};

// Tách phần core thành OrderManagementBase
export const OrderManagementBase = ({
  fetchOrdersApi,
  updateOrderStatusApi,
  canUpdateStatus = true,
  title = "Quản lý đơn hàng",
  searchUserPlaceholder = "Tìm theo Mã đơn",
  searchNamePlaceholder = "Tìm theo tên khách hàng",
  statusLabelsOverride,
  statusIconsOverride,
  statusColorsOverride,
  statusWorkflowOverride,
}) => {
  const [orders, setOrders] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [orderNumberSearch, setOrderNumberSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [statusUpdateModal, setStatusUpdateModal] = useState({
    visible: false,
    order: null,
  });

  const _statusLabels = statusLabelsOverride || statusLabels;
  const _statusColors = statusColorsOverride || statusColors;
  const _statusIcons = statusIconsOverride || statusIcons;
  const _statusWorkflow = statusWorkflowOverride || statusWorkflow;

  const fetchOrders = async (
    status = "pending",
    page = 1,
    pageSize = 10,
    orderNumber = "",
    userName = ""
  ) => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize, status };
      if (orderNumber) params.orderNumber = orderNumber;
      if (userName) params.userName = userName;
      const res = await fetchOrdersApi(params);

      setOrders((prev) => ({
        ...prev,
        [status]: res.data.orders,
      }));

      setPagination({
        current: page,
        pageSize,
        total: res.data.pagination.total,
      });
    } catch (err) {
      message.error("Lỗi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(
      activeTab,
      pagination.current,
      pagination.pageSize,
      orderNumberSearch,
      nameSearch
    );
    // eslint-disable-next-line
  }, [activeTab]);

  const handleTableChange = (pag) => {
    setPagination((prev) => ({
      ...prev,
      current: pag.current,
      pageSize: pag.pageSize,
    }));
    fetchOrders(
      activeTab,
      pag.current,
      pag.pageSize,
      orderNumberSearch,
      nameSearch
    );
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset về trang 1 khi đổi tab
  };

  const handleOrderNumberSearch = (value) => {
    setOrderNumberSearch(value);
    fetchOrders(activeTab, 1, pagination.pageSize, value, nameSearch);
  };

  const handleNameSearch = (value) => {
    setNameSearch(value);
    fetchOrders(activeTab, 1, pagination.pageSize, orderNumberSearch, value);
  };

  const handleChangeOrderStatus = async (order, newStatus) => {
    try {
      await updateOrderStatusApi(order._id, newStatus);
      message.success("Đã cập nhật trạng thái đơn hàng");
      setStatusUpdateModal({ visible: false, order: null });

      // Cập nhật lại dữ liệu cho tab hiện tại
      fetchOrders(
        activeTab,
        1,
        pagination.pageSize,
        orderNumberSearch,
        nameSearch
      );
    } catch (err) {
      message.error(
        err.response?.data?.message || "Cập nhật trạng thái thất bại"
      );
    }
  };

  const openStatusUpdateModal = (order) => {
    setStatusUpdateModal({ visible: true, order });
  };

  const getColumns = (status) => [
    {
      title: "Mã đơn",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: "12%",
      ellipsis: true,
      render: (orderNumber) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {orderNumber}
        </span>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: ["user", "name"],
      key: "user",
      width: "18%",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.user?.name || "Khách hàng"}</div>
          <div className="text-xs text-gray-500">{record.user?.email}</div>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "items",
      key: "items",
      width: "15%",
      render: (items) => (
        <div className="text-sm">
          <div>{items?.length || 0} sản phẩm</div>
          <div className="text-xs text-gray-500 truncate">
            {items
              ?.slice(0, 2)
              .map((item) => item.name)
              .join(", ")}
            {items?.length > 2 && "..."}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "12%",
      render: (orderStatus) => (
        <Tag
          color={_statusColors[orderStatus]}
          icon={_statusIcons[orderStatus]}
          className="flex items-center gap-1"
        >
          {_statusLabels[orderStatus]}
        </Tag>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: "12%",
      render: (paymentStatus) => (
        <Tag
          color={paymentStatusColors[paymentStatus]}
          icon={paymentStatusIcons[paymentStatus]}
          className="flex items-center gap-1"
        >
          {paymentStatusLabels[paymentStatus]}
        </Tag>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: "12%",
      align: "right",
      render: (amount) => (
        <span className="font-medium text-green-600">
          {amount?.toLocaleString()} ₫
        </span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "12%",
      render: (date) => (
        <div className="text-sm">
          <div>{new Date(date).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">
            {new Date(date).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: "10%",
      align: "right",
      render: (_, order) => {
        const availableStatuses = _statusWorkflow[status] || [];
        return (
          <Space>
            {canUpdateStatus && availableStatuses.length > 0 && (
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openStatusUpdateModal(order)}
              >
                Cập nhật
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  const getTabItems = () => {
    return Object.entries(_statusLabels).map(([key, label]) => ({
      key,
      label: (
        <span>
          {_statusIcons[key]} {label}
        </span>
      ),
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex gap-2">
          <SearchFloatingLabel
            value={orderNumberSearch}
            onChange={setOrderNumberSearch}
            onSearch={handleOrderNumberSearch}
            placeholder={searchUserPlaceholder}
            label={searchUserPlaceholder}
            icon={<SearchOutlined style={{ fontSize: 16, marginRight: 4 }} />}
          />
          <SearchFloatingLabel
            value={nameSearch}
            onChange={setNameSearch}
            onSearch={handleNameSearch}
            placeholder={searchNamePlaceholder}
            label={searchNamePlaceholder}
            icon={<SearchOutlined style={{ fontSize: 16, marginRight: 4 }} />}
          />
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={getTabItems()}
        type="card"
        size="large"
        style={{ width: "100%" }}
      />

      <div className="mt-4">
        <Table
          columns={getColumns(activeTab)}
          dataSource={orders[activeTab] || []}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowClassName={(record) => {
            if (record.status === "cancelled") return "bg-red-50 opacity-70";
            if (record.status === "delivered") return "bg-green-50";
            return "";
          }}
        />
      </div>

      {/* Modal cập nhật trạng thái */}
      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={statusUpdateModal.visible}
        onCancel={() => setStatusUpdateModal({ visible: false, order: null })}
        footer={null}
        width={400}
      >
        {statusUpdateModal.order && (
          <div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="font-medium">
                Mã đơn: {statusUpdateModal.order.orderNumber}
              </div>
              <div className="text-sm text-gray-600">
                Trạng thái hiện tại:
                <Tag
                  color={_statusColors[statusUpdateModal.order.status]}
                  className="ml-2"
                >
                  {_statusLabels[statusUpdateModal.order.status]}
                </Tag>
              </div>
            </div>

            <p className="block text-sm font-medium mb-2">
              Chọn trạng thái mới:
            </p>
            <div className="flex flex-col gap-2">
              {_statusWorkflow[statusUpdateModal.order.status]?.map(
                (status) => (
                  <Button
                    key={status}
                    icon={_statusIcons[status]}
                    onClick={() =>
                      handleChangeOrderStatus(statusUpdateModal.order, status)
                    }
                    block
                  >
                    {_statusLabels[status]}
                  </Button>
                )
              )}
            </div>

            <div className="text-xs text-gray-500 mt-4">
              <strong>Lưu ý:</strong> Việc thay đổi trạng thái không thể hoàn
              tác.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Component chính sử dụng cho trang quản lý của Admin
const OrderManagement = () => {
  return (
    <OrderManagementBase
      fetchOrdersApi={adminAPI.getOrders}
      updateOrderStatusApi={adminAPI.updateOrderStatus}
      canUpdateStatus={true}
      title="Quản lý đơn hàng"
      searchUserPlaceholder="Tìm theo Mã đơn"
      searchNamePlaceholder="Tìm theo tên khách hàng"
      statusLabelsOverride={statusLabels}
      statusIconsOverride={statusIcons}
      statusColorsOverride={statusColors}
      statusWorkflowOverride={statusWorkflow}
    />
  );
};

export default OrderManagement;
