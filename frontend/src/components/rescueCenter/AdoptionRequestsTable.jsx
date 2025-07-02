import React from 'react';
import { Card, Table, Tag, Space, Button, Select, Tooltip, Badge } from 'antd';
import { Link } from 'react-router-dom';
import {
    FilterOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const AdoptionRequestsTable = ({
    adoptionRequests,
    filteredAdoptionRequests,
    loading,
    currentPage,
    pageSize,
    statusFilter,
    onStatusFilterChange,
    onPageChange,
    onUpdateStatus
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
                    {record.pet?.images?.[0] && (
                        <img
                            className="h-12 w-12 rounded-lg object-cover mr-3"
                            src={record.pet.images[0].url}
                            alt={record.pet.name}
                        />
                    )}
                    <div>
                        <div className="font-medium text-gray-900">{record.pet?.name}</div>
                        <div className="text-sm text-gray-500">{record.pet?.breed}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Người đăng ký',
            key: 'applicant',
            render: (_, record) => (
                <div>
                    <div className="font-medium text-gray-900">{record.applicant?.name}</div>
                    <div className="text-sm text-gray-500">{record.applicant?.email}</div>
                    <div className="text-xs text-gray-400">{record.applicant?.phone}</div>
                </div>
            ),
        },
        {
            title: 'Ngày đăng ký',
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
            title: 'Trạng thái',
            key: 'status',
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
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Link to={`/adoptions/${record._id}`}>
                            <Button type="link" icon={<EyeOutlined />} size="small" />
                        </Link>
                    </Tooltip>
                    {record.status === 'pending' && (
                        <>
                            <Tooltip title="Duyệt">
                                <Button
                                    type="link"
                                    icon={<CheckOutlined />}
                                    size="small"
                                    onClick={() => onUpdateStatus(record._id, 'approved')}
                                />
                            </Tooltip>
                            <Tooltip title="Từ chối">
                                <Button
                                    type="link"
                                    danger
                                    icon={<CloseOutlined />}
                                    size="small"
                                    onClick={() => onUpdateStatus(record._id, 'rejected')}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={
                <div className="flex justify-between items-center">
                    <span>Đơn nhận nuôi ({filteredAdoptionRequests.length})</span>
                    <div className="flex items-center space-x-2">
                        <FilterOutlined className="text-gray-500" />
                        <Select
                            value={statusFilter}
                            onChange={onStatusFilterChange}
                            style={{ width: 120 }}
                            size="small"
                        >
                            <Option value="all">Tất cả</Option>
                            <Option value="pending">Đang chờ</Option>
                            <Option value="approved">Đã duyệt</Option>
                            <Option value="rejected">Từ chối</Option>
                        </Select>
                    </div>
                </div>
            }
            className="shadow-md"
        >
            {filteredAdoptionRequests.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-4xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Chưa có đơn nhận nuôi nào
                    </h3>
                    <p className="text-gray-500">
                        {adoptionRequests.length === 0
                            ? "Chưa có đơn nhận nuôi nào được gửi đến trung tâm của bạn."
                            : "Không có đơn nhận nuôi nào phù hợp với bộ lọc hiện tại."
                        }
                    </p>
                </div>
            ) : (
                <Table
                    columns={columns}
                    dataSource={filteredAdoptionRequests}
                    rowKey="_id"
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: filteredAdoptionRequests.length,
                        onChange: onPageChange,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} đơn nhận nuôi`,
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

export default AdoptionRequestsTable; 