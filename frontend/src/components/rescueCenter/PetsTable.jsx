import React from 'react';
import { Card, Table, Tag, Space, Button, Select, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import {
    FilterOutlined,
    EyeOutlined,
    EditOutlined,
    CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const PetsTable = ({
    pets,
    filteredPets,
    loading,
    currentPage,
    pageSize,
    statusFilter,
    onStatusFilterChange,
    onPageChange,
    onDeletePet
}) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'green';
            case 'pending': return 'orange';
            case 'adopted': return 'blue';
            case 'approved': return 'green';
            case 'rejected': return 'red';
            case 'completed': return 'blue';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'available': return 'Có sẵn';
            case 'pending': return 'Đang chờ';
            case 'adopted': return 'Đã nhận nuôi';
            case 'approved': return 'Đã duyệt';
            case 'rejected': return 'Từ chối';
            case 'completed': return 'Hoàn thành';
            default: return status;
        }
    };

    const columns = [
        {
            title: 'Thú cưng',
            key: 'pet',
            render: (_, record) => (
                <div className="flex items-center">
                    {record.images?.[0] && (
                        <img
                            className="h-12 w-12 rounded-lg object-cover mr-3"
                            src={record.images[0].url}
                            alt={record.name}
                        />
                    )}
                    <div>
                        <div className="font-medium text-gray-900">{record.name}</div>
                        <div className="text-sm text-gray-500">{record.species} • {record.breed}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Tuổi',
            key: 'age',
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.age?.value || 0} {record.age?.unit || 'tháng'}</div>
                    <div className="text-sm text-gray-500">
                        {record.gender === 'male' ? 'Đực' : 'Cái'}
                    </div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => (
                <Tag color={getStatusColor(record.status)}>
                    {getStatusText(record.status)}
                </Tag>
            ),
        },
        {
            title: 'Ngày tạo',
            key: 'createdAt',
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
            title: 'Thao tác',
            key: 'actions',
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
                            icon={<CloseOutlined />}
                            size="small"
                            disabled={record.status !== 'available'}
                            onClick={() => onDeletePet(record._id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={
                <div className="flex justify-between items-center">
                    <span>Thú cưng của bạn ({filteredPets.length})</span>
                    <div className="flex items-center space-x-2">
                        <FilterOutlined className="text-gray-500" />
                        <Select
                            value={statusFilter}
                            onChange={onStatusFilterChange}
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
            {filteredPets.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-4xl mb-4">🐾</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chưa có thú cưng nào
                    </h3>
                    <p className="text-gray-500">
                        {pets.length === 0
                            ? "Bắt đầu bằng cách thêm thú cưng đầu tiên của bạn"
                            : "Không có thú cưng nào phù hợp với bộ lọc hiện tại."
                        }
                    </p>
                </div>
            ) : (
                <Table
                    columns={columns}
                    dataSource={filteredPets}
                    rowKey="_id"
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: filteredPets.length,
                        onChange: onPageChange,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} thú cưng`,
                        pageSizeOptions: ['10', '20', '50'],
                        size: 'small',
                    }}
                    loading={loading}
                    size="small"
                    locale={{
                        emptyText: 'Không có dữ liệu',
                        triggerDesc: 'Sắp xếp giảm dần',
                        triggerAsc: 'Sắp xếp tăng dần',
                        cancelSort: 'Hủy sắp xếp'
                    }}
                />
            )}
        </Card>
    );
};

export default PetsTable; 