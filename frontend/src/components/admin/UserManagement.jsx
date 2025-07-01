import React, { useEffect, useState } from "react";
import { Table, Button, Popconfirm, message, Tag, Select, Input, Tooltip, Modal } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { adminAPI } from "../../services/api";

const { Option } = Select;

const roleLabels = {
    user: "Người dùng",
    shop_owner: "Chủ cửa hàng",
    rescue_center: "Trung tâm cứu hộ",
    admin: "Quản trị viên",
};

const roleColors = {
    user: "default",
    shop_owner: "blue",
    rescue_center: "green",
    admin: "red",
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState("");

    const fetchUsers = async (page = 1, pageSize = 10, role, searchText) => {
        setLoading(true);
        try {
            const params = { page, limit: pageSize };
            if (role) params.role = role;
            if (searchText) params.search = searchText;
            const res = await adminAPI.getUsers(params);
            setUsers(res.data.users);
            setPagination({
                current: page,
                pageSize,
                total: res.data.pagination.total,
            });
        } catch (err) {
            message.error("Lỗi tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(pagination.current, pagination.pageSize, roleFilter, search);
        // eslint-disable-next-line
    }, [pagination.current, pagination.pageSize, roleFilter]);

    const handleTableChange = (pag) => {
        setPagination((prev) => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
    };

    const handleSearch = (value) => {
        setSearch(value);
        fetchUsers(1, pagination.pageSize, roleFilter, value);
    };

    const handleRoleChange = (role) => {
        setRoleFilter(role);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleDelete = async (id) => {
        try {
            await adminAPI.deleteUser(id);
            message.success("Đã xóa người dùng");
            fetchUsers(pagination.current, pagination.pageSize, roleFilter, search);
        } catch {
            message.error("Xóa thất bại");
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setModalOpen(true);
    };

    const handleModalOk = async () => {
        if (!selectedUser || newRole === selectedUser.role) {
            setModalOpen(false);
            return;
        }
        try {
            await adminAPI.changeUserRole(selectedUser._id, newRole);
            message.success("Đã đổi vai trò");
            setModalOpen(false);
            fetchUsers(pagination.current, pagination.pageSize, roleFilter, search);
        } catch (err) {
            message.error(err.response?.data?.message || "Đổi vai trò thất bại");
        }
    };

    const columns = [
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
            width: "20%",
            ellipsis: true,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: "25%",
            ellipsis: true,
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            width: "15%",
            ellipsis: true,
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            width: "25%",
            align: "center",
            render: (role, user) => (
                <Tag color={roleColors[role]}>{roleLabels[role]}</Tag>
            ),
        },
        {
            title: "",
            key: "action",
            width: "15%",
            align: "right",
            render: (_, user) => (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    {user.role !== "admin" && (
                        <Tooltip title="Đổi vai trò">
                            <Button
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => openEditModal(user)}
                                style={{ marginRight: 4 }}
                            />
                        </Tooltip>
                    )}
                    <Popconfirm title="Xóa người dùng này?" onConfirm={() => handleDelete(user._id)} okText="Xóa" cancelText="Hủy">
                        <Button icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Quản lý người dùng</h2>
            <div className="flex gap-2 mb-4">
                <Input.Search
                    placeholder="Tìm kiếm tên, email, SĐT"
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                />
                <Select
                    allowClear
                    placeholder="Lọc vai trò"
                    style={{ width: 180 }}
                    onChange={handleRoleChange}
                >
                    <Option value="user">Người dùng</Option>
                    <Option value="shop_owner">Chủ cửa hàng</Option>
                    <Option value="rescue_center">Trung tâm cứu hộ</Option>
                    <Option value="admin">Quản trị viên</Option>
                </Select>
            </div>
            <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                }}
                onChange={handleTableChange}
            />
            <Modal
                title="Đổi vai trò người dùng"
                open={modalOpen}
                onOk={handleModalOk}
                onCancel={() => setModalOpen(false)}
                okText="Lưu"
                cancelText="Hủy"
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div>
                            <span className="font-semibold">Tên:</span> {selectedUser.name}
                        </div>
                        <div>
                            <span className="font-semibold">Email:</span> {selectedUser.email}
                        </div>
                        <div>
                            <span className="font-semibold">Vai trò hiện tại:</span> {roleLabels[selectedUser.role]}
                        </div>
                        <div>
                            <span className="font-semibold">Chọn vai trò mới:</span>
                            <Select
                                value={newRole}
                                style={{ width: 200, marginLeft: 8 }}
                                onChange={setNewRole}
                            >
                                <Option value="user">Người dùng</Option>
                                <Option value="shop_owner">Chủ cửa hàng</Option>
                                <Option value="rescue_center">Trung tâm cứu hộ</Option>
                            </Select>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserManagement; 