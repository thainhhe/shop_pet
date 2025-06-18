"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";
import {
    Table,
    Card,
    Tag,
    Space,
    Button,
    Modal,
    DatePicker,
    Row,
    Col,
    Statistic,
    Select,
    Tooltip,
    Badge
} from "antd";
import {
    HeartOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    CalendarOutlined,
    FilterOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Cấu hình dayjs
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');

const { MonthPicker, RangePicker } = DatePicker;
const { Option } = Select;

const PetManagement = () => {
    const { user, token } = useAuth();
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Date filtering states
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [dateRange, setDateRange] = useState(null);
    const [dateFilterType, setDateFilterType] = useState('month'); // 'month' or 'range'

    // Status filtering
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchMyPets();
    }, [token]);

    const fetchMyPets = async () => {
        try {
            setLoading(true);
            // Use rescue pets API
            const response = await api.get('/shop/rescue-pets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPets(response.data);
        } catch (err) {
            setError("Không thể tải danh sách thú cưng");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (petId) => {
        Modal.confirm({
            title: "Bạn có chắc chắn muốn xóa thú cưng này?",
            content: "Hành động này không thể hoàn tác.",
            okText: "Có",
            okType: "danger",
            cancelText: "Không",
            onOk: async () => {
                try {
                    await api.delete(`/pets/${petId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    setPets(pets.filter((pet) => pet._id !== petId));
                } catch (err) {
                    Modal.error({
                        title: "Lỗi",
                        content: "Không thể xóa thú cưng",
                    });
                }
            },
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'green';
            case 'pending': return 'orange';
            case 'adopted': return 'blue';
            case 'sold': return 'default';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'available': return 'Có sẵn';
            case 'pending': return 'Đang chờ';
            case 'adopted': return 'Đã nhận nuôi';
            case 'sold': return 'Đã bán';
            default: return status;
        }
    };

    // Filter pets by date and status
    const filteredPets = pets.filter(pet => {
        // Date filtering
        let dateMatch = true;
        if (dateFilterType === 'month' && selectedMonth) {
            const petDate = dayjs(pet.createdAt);
            dateMatch = petDate.isSame(selectedMonth, 'month');
        } else if (dateFilterType === 'range' && dateRange && dateRange.length === 2) {
            const petDate = dayjs(pet.createdAt);
            dateMatch = petDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
        }

        // Status filtering
        let statusMatch = true;
        if (statusFilter !== 'all') {
            statusMatch = pet.status === statusFilter;
        }

        return dateMatch && statusMatch;
    });

    // Calculate stats for filtered pets
    const stats = {
        total: filteredPets.length,
        available: filteredPets.filter(pet => pet.status === 'available').length,
        pending: filteredPets.filter(pet => pet.status === 'pending').length,
        adopted: filteredPets.filter(pet => pet.status === 'adopted').length,
    };

    const handleDateFilterChange = (type, value) => {
        setDateFilterType(type);
        if (type === 'month') {
            setSelectedMonth(value);
            setDateRange(null);
        } else {
            setDateRange(value);
            setSelectedMonth(null);
        }
        // Reset pagination when filter changes
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (value) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const columns = [
        {
            title: "Thú cưng",
            key: "pet",
            render: (_, record) => (
                <div className="flex items-center">
                    <img
                        className="h-12 w-12 rounded-lg object-cover mr-3"
                        src={
                            record.images?.[0]?.url ||
                            "/placeholder.svg?height=48&width=48"
                        }
                        alt={record.name}
                    />
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {record.name}
                        </div>
                        <div className="text-sm text-gray-500">{record.species} • {record.breed}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Loại",
            key: "species",
            render: (_, record) => (
                <div>
                    <div className="text-sm text-gray-900">{record.species}</div>
                    <div className="text-sm text-gray-500">
                        {record.gender === "male" ? "Đực" : "Cái"}
                    </div>
                </div>
            ),
        },
        {
            title: "Tuổi",
            key: "age",
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.age?.value || 0} {record.age?.unit || 'tháng'}</div>
                </div>
            ),
        },
        {
            title: "Giá",
            key: "price",
            render: (_, record) => (
                <div className="text-sm text-gray-900">
                    {record.isForAdoption ? (
                        <span className="text-green-600 font-medium">Miễn phí</span>
                    ) : (
                        new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        }).format(record.price)
                    )}
                </div>
            ),
        },
        {
            title: "Trạng thái",
            key: "status",
            render: (_, record) => (
                <Badge
                    status={getStatusColor(record.status)}
                    text={
                        <Tag color={getStatusColor(record.status)}>
                            {getStatusText(record.status)}
                        </Tag>
                    }
                />
            ),
        },
        {
            title: "Ngày tạo",
            key: "createdAt",
            render: (_, record) => (
                <div>
                    <div className="font-medium">{dayjs(record.createdAt).format('DD/MM/YYYY')}</div>
                    <div className="text-sm text-gray-500">
                        {dayjs(record.createdAt).fromNow()}
                    </div>
                </div>
            ),
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Link to={`/pets/${record._id}`}>
                            <Button type="link" icon={<EyeOutlined />} size="small" />
                        </Link>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Link to={`/pets/${record._id}/edit`}>
                            <Button type="link" icon={<EditOutlined />} size="small" />
                        </Link>
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => handleDelete(record._id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

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
                        <span className="text-sm font-medium text-gray-700">Lọc theo thời gian:</span>
                    </div>

                    <Select
                        value={dateFilterType}
                        onChange={(value) => handleDateFilterChange(value, null)}
                        style={{ width: 120 }}
                    >
                        <Option value="month">Theo tháng</Option>
                        <Option value="range">Khoảng thời gian</Option>
                    </Select>

                    {dateFilterType === 'month' ? (
                        <MonthPicker
                            value={selectedMonth}
                            onChange={(value) => handleDateFilterChange('month', value)}
                            placeholder="Chọn tháng"
                            format="MM/YYYY"
                            style={{ width: 150 }}
                        />
                    ) : (
                        <RangePicker
                            value={dateRange}
                            onChange={(value) => handleDateFilterChange('range', value)}
                            placeholder={['Từ ngày', 'Đến ngày']}
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
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đang chờ"
                            value={stats.pending}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đã nhận nuôi"
                            value={stats.adopted}
                            valueStyle={{ color: '#1890ff' }}
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
                            pageSizeOptions: ['10', '20', '50'],
                            size: 'small',
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