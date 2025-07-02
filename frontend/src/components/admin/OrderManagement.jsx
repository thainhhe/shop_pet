import React, { useEffect, useState } from "react";
import { Table, Tag, Button, message, Input, Tabs, Space, Modal, Select } from "antd";
import { adminAPI } from "../../services/api";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CarOutlined,
    CheckOutlined,
    CloseCircleOutlined,
    EditOutlined,
    SearchOutlined
} from "@ant-design/icons";
import "./OrderManagement.css";

const { Option } = Select;
const { TabPane } = Tabs;

// Floating label search input component
const SearchFloatingLabel = ({ value, onChange, onSearch, placeholder, label, icon }) => {
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
                onChange={e => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <label className="form__group_oneform__label">
                {icon} {label}
            </label>
        </div>
    );
};

const statusLabels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang chuẩn bị",
    shipped: "Đã gửi đi",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
};

const statusColors = {
    pending: "default",
    confirmed: "blue",
    processing: "orange",
    shipped: "purple",
    delivered: "green",
    cancelled: "red",
};

const statusIcons = {
    pending: <ClockCircleOutlined />,
    confirmed: <CheckCircleOutlined />,
    processing: <EditOutlined />,
    shipped: <CarOutlined />,
    delivered: <CheckOutlined />,
    cancelled: <CloseCircleOutlined />,
};

// Định nghĩa workflow cho việc chuyển trạng thái
const statusWorkflow = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [], // Không thể chuyển từ delivered
    cancelled: [], // Không thể chuyển từ cancelled
};

const OrderManagement = () => {
    const [orders, setOrders] = useState({});
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("pending");
    const [userSearch, setUserSearch] = useState("");
    const [nameSearch, setNameSearch] = useState("");
    const [statusUpdateModal, setStatusUpdateModal] = useState({ visible: false, order: null });

    const fetchOrders = async (status = "pending", page = 1, pageSize = 10, userId = "", userName = "") => {
        setLoading(true);
        try {
            const params = { page, limit: pageSize, status };
            if (userId) params.userId = userId;
            if (userName) params.userName = userName;
            const res = await adminAPI.getOrders(params);

            setOrders(prev => ({
                ...prev,
                [status]: res.data.orders
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
        fetchOrders(activeTab, pagination.current, pagination.pageSize, userSearch, nameSearch);
        // eslint-disable-next-line
    }, [activeTab, pagination.current, pagination.pageSize]);

    const handleTableChange = (pag) => {
        setPagination((prev) => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleUserSearch = (value) => {
        setUserSearch(value);
        fetchOrders(activeTab, 1, pagination.pageSize, value, nameSearch);
    };

    const handleNameSearch = (value) => {
        setNameSearch(value);
        fetchOrders(activeTab, 1, pagination.pageSize, userSearch, value);
    };

    const handleChangeOrderStatus = async (order, newStatus) => {
        try {
            await adminAPI.updateOrderStatus(order._id, newStatus);
            message.success("Đã cập nhật trạng thái đơn hàng");

            // Cập nhật lại dữ liệu cho cả trạng thái cũ và mới
            fetchOrders(activeTab, pagination.current, pagination.pageSize, userSearch, nameSearch);

            // Nếu order được chuyển sang trạng thái khác, cập nhật tab đó
            if (newStatus !== activeTab) {
                fetchOrders(newStatus, 1, pagination.pageSize, userSearch, nameSearch);
            }

            setStatusUpdateModal({ visible: false, order: null });
        } catch (err) {
            message.error(err.response?.data?.message || "Cập nhật trạng thái thất bại");
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
            width: "15%",
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
            width: "25%",
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.user?.name}</div>
                    <div className="text-xs text-gray-500">{record.user?.email}</div>
                    <div className="text-xs text-gray-400">{record.user?.role}</div>
                </div>
            ),
        },
        {
            title: "Sản phẩm",
            dataIndex: "items",
            key: "items",
            width: "20%",
            render: (items) => (
                <div className="text-sm">
                    <div>{items?.length || 0} sản phẩm</div>
                    <div className="text-xs text-gray-500">
                        {items?.slice(0, 2).map(item => item.name).join(", ")}
                        {items?.length > 2 && "..."}
                    </div>
                </div>
            ),
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalAmount",
            key: "totalAmount",
            width: "15%",
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
            width: "15%",
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
                const availableStatuses = statusWorkflow[status] || [];
                return (
                    <Space>
                        {availableStatuses.length > 0 && (
                            <Button
                                type="primary"
                                size="small"
                                icon={statusIcons[availableStatuses[0]]}
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
        return Object.entries(statusLabels).map(([key, label]) => ({
            key,
            label: (
                <span>
                    {statusIcons[key]} {label}
                </span>
            ),
        }));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>
                <div className="flex gap-2">
                    <SearchFloatingLabel
                        value={userSearch}
                        onChange={setUserSearch}
                        onSearch={handleUserSearch}
                        placeholder="Tìm theo ID khách hàng"
                        label="Tìm theo ID khách hàng"
                        icon={<SearchOutlined style={{ fontSize: 16, marginRight: 4 }} />}
                    />
                    <SearchFloatingLabel
                        value={nameSearch}
                        onChange={setNameSearch}
                        onSearch={handleNameSearch}
                        placeholder="Tìm theo tên khách hàng"
                        label="Tìm theo tên khách hàng"
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
                style={{ width: '100%' }}
                tabBarStyle={{ marginBottom: 16 }}
                tabBarGutter={0}
            />

            <div className="mt-4">
                <Table
                    columns={getColumns(activeTab)}
                    dataSource={orders[activeTab] || []}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} đơn hàng`,
                    }}
                    onChange={handleTableChange}
                    rowClassName={(record) => {
                        if (record.status === "cancelled") return "bg-red-50";
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
                width={500}
            >
                {statusUpdateModal.order && (
                    <div>
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="font-medium">Mã đơn: {statusUpdateModal.order.orderNumber}</div>
                            <div className="text-sm text-gray-600">
                                Khách hàng: {statusUpdateModal.order.user?.name}
                            </div>
                            <div className="text-sm text-gray-600">
                                Trạng thái hiện tại:
                                <Tag color={statusColors[statusUpdateModal.order.status]} className="ml-2">
                                    {statusLabels[statusUpdateModal.order.status]}
                                </Tag>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Chọn trạng thái mới:
                            </label>
                            <Select
                                style={{ width: "100%" }}
                                placeholder="Chọn trạng thái"
                                onChange={(newStatus) => handleChangeOrderStatus(statusUpdateModal.order, newStatus)}
                            >
                                {statusWorkflow[statusUpdateModal.order.status]?.map((status) => (
                                    <Option value={status} key={status}>
                                        <span>
                                            {statusIcons[status]} {statusLabels[status]}
                                        </span>
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <div className="text-xs text-gray-500">
                            <strong>Lưu ý:</strong> Việc thay đổi trạng thái sẽ được ghi nhận và không thể hoàn tác.
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrderManagement; 