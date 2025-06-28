"use client";

import { useState, useEffect } from "react";
import { Layout, Menu, Card, Row, Col, Statistic, Spin, Tabs } from "antd";
import { UserOutlined, ShoppingOutlined, DashboardOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import UserManagement from "../components/admin/UserManagement";
import OrderManagement from "../components/admin/OrderManagement";
import { adminAPI } from "../services/api";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
    CartesianGrid, ComposedChart
} from 'recharts';

const { Sider, Content } = Layout;
const { TabPane } = Tabs;

const AdminDashboard = () => {
    const { user } = useAuth();
    const [selectedKey, setSelectedKey] = useState("dashboard");
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        if (user?.role === "admin" && selectedKey === "dashboard") {
            setLoadingStats(true);
            adminAPI.getStats()
                .then(res => setStats(res.data))
                .catch(() => setStats(null))
                .finally(() => setLoadingStats(false));
        }
    }, [user, selectedKey]);

    // Custom colors for charts
    const chartColors = {
        primary: '#1890ff',
        secondary: '#52c41a',
        tertiary: '#faad14',
        quaternary: '#f5222d',
        gradient1: '#667eea',
        gradient2: '#764ba2',
        gradient3: '#f093fb',
        gradient4: '#f5576c'
    };

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: <span className="font-bold">{entry.value}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderContent = () => {
        switch (selectedKey) {
            case "users":
                return <UserManagement />;
            case "orders":
                return <OrderManagement />;
            default:
                // Prepare data for different chart types
                const barChartData = stats ? [
                    {
                        name: 'Người dùng',
                        '7 ngày': stats.users.last7Days,
                        '30 ngày': stats.users.last30Days,
                    },
                    {
                        name: 'Sản phẩm',
                        '7 ngày': stats.products.last7Days,
                        '30 ngày': stats.products.last30Days,
                    },
                    {
                        name: 'Đơn hàng',
                        '7 ngày': stats.orders.last7Days,
                        '30 ngày': stats.orders.last30Days,
                    },
                ] : [];

                const pieChartData = stats ? [
                    { name: 'Người dùng mới', value: stats.users.last30Days, color: chartColors.primary },
                    { name: 'Sản phẩm mới', value: stats.products.last30Days, color: chartColors.secondary },
                    { name: 'Đơn hàng mới', value: stats.orders.last30Days, color: chartColors.tertiary },
                ] : [];

                const lineChartData = stats ? [
                    { period: '7 ngày', Người_dùng: stats.users.last7Days, Sản_phẩm: stats.products.last7Days, Đơn_hàng: stats.orders.last7Days },
                    { period: '30 ngày', Người_dùng: stats.users.last30Days, Sản_phẩm: stats.products.last30Days, Đơn_hàng: stats.orders.last30Days },
                ] : [];

                const areaChartData = stats ? [
                    { period: '7 ngày', 'Người dùng': stats.users.last7Days, 'Sản phẩm': stats.products.last7Days, 'Đơn hàng': stats.orders.last7Days },
                    { period: '30 ngày', 'Người dùng': stats.users.last30Days, 'Sản phẩm': stats.products.last30Days, 'Đơn hàng': stats.orders.last30Days },
                ] : [];

                return (
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Tổng quan hệ thống</h1>
                        {loadingStats ? (
                            <div className="flex justify-center items-center h-40">
                                <Spin size="large" />
                            </div>
                        ) : stats ? (
                            <>
                                {/* Statistics Cards */}
                                <Row gutter={[24, 24]} className="mb-8">
                                    <Col xs={24} md={8}>
                                        <Card
                                            bordered={false}
                                            className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                                        >
                                            <div className="text-white">
                                                <Statistic
                                                    title={<span className="text-white text-lg">Người dùng mới</span>}
                                                    value={stats.users.last30Days}
                                                    valueStyle={{ color: '#ffffff', fontSize: '2rem', fontWeight: 'bold' }}
                                                    suffix={
                                                        <div className="text-sm opacity-80">
                                                            <div>7 ngày: {stats.users.last7Days}</div>
                                                            <div>30 ngày: {stats.users.last30Days}</div>
                                                        </div>
                                                    }
                                                />
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Card
                                            bordered={false}
                                            className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                                            style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
                                        >
                                            <div className="text-white">
                                                <Statistic
                                                    title={<span className="text-white text-lg">Sản phẩm mới</span>}
                                                    value={stats.products.last30Days}
                                                    valueStyle={{ color: '#ffffff', fontSize: '2rem', fontWeight: 'bold' }}
                                                    suffix={
                                                        <div className="text-sm opacity-80">
                                                            <div>7 ngày: {stats.products.last7Days}</div>
                                                            <div>30 ngày: {stats.products.last30Days}</div>
                                                        </div>
                                                    }
                                                />
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col xs={24} md={8}>
                                        <Card
                                            bordered={false}
                                            className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                                            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
                                        >
                                            <div className="text-white">
                                                <Statistic
                                                    title={<span className="text-white text-lg">Đơn hàng mới</span>}
                                                    value={stats.orders.last30Days}
                                                    valueStyle={{ color: '#ffffff', fontSize: '2rem', fontWeight: 'bold' }}
                                                    suffix={
                                                        <div className="text-sm opacity-80">
                                                            <div>7 ngày: {stats.orders.last7Days}</div>
                                                            <div>30 ngày: {stats.orders.last30Days}</div>
                                                        </div>
                                                    }
                                                />
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Charts Section */}
                                <Card bordered={false} className="shadow-lg">
                                    <Tabs defaultActiveKey="1" size="large">
                                        <TabPane tab="Biểu đồ cột" key="1">
                                            <div className="mt-4">
                                                <h3 className="text-xl font-semibold mb-6 text-center">Thống kê theo thời gian</h3>
                                                <ResponsiveContainer width="100%" height={400}>
                                                    <ComposedChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                        <XAxis
                                                            dataKey="name"
                                                            tick={{ fontSize: 14, fill: '#666' }}
                                                            axisLine={{ stroke: '#ddd' }}
                                                        />
                                                        <YAxis
                                                            tick={{ fontSize: 12, fill: '#666' }}
                                                            axisLine={{ stroke: '#ddd' }}
                                                        />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Legend
                                                            wrapperStyle={{ paddingTop: '20px' }}
                                                            iconType="circle"
                                                        />
                                                        <Bar
                                                            dataKey="7 ngày"
                                                            name="7 ngày qua"
                                                            fill={chartColors.primary}
                                                            radius={[4, 4, 0, 0]}
                                                            barSize={30}
                                                        />
                                                        <Bar
                                                            dataKey="30 ngày"
                                                            name="30 ngày qua"
                                                            fill={chartColors.secondary}
                                                            radius={[4, 4, 0, 0]}
                                                            barSize={30}
                                                        />
                                                    </ComposedChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </TabPane>

                                        <TabPane tab="Biểu đồ đường" key="2">
                                            <div className="mt-4">
                                                <h3 className="text-xl font-semibold mb-6 text-center">Xu hướng phát triển</h3>
                                                <ResponsiveContainer width="100%" height={400}>
                                                    <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                        <XAxis
                                                            dataKey="period"
                                                            tick={{ fontSize: 14, fill: '#666' }}
                                                            axisLine={{ stroke: '#ddd' }}
                                                        />
                                                        <YAxis
                                                            tick={{ fontSize: 12, fill: '#666' }}
                                                            axisLine={{ stroke: '#ddd' }}
                                                        />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Legend
                                                            wrapperStyle={{ paddingTop: '20px' }}
                                                            iconType="line"
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="Người_dùng"
                                                            name="Người dùng"
                                                            stroke={chartColors.primary}
                                                            strokeWidth={3}
                                                            dot={{ fill: chartColors.primary, strokeWidth: 2, r: 6 }}
                                                            activeDot={{ r: 8, stroke: chartColors.primary, strokeWidth: 2 }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="Sản_phẩm"
                                                            name="Sản phẩm"
                                                            stroke={chartColors.secondary}
                                                            strokeWidth={3}
                                                            dot={{ fill: chartColors.secondary, strokeWidth: 2, r: 6 }}
                                                            activeDot={{ r: 8, stroke: chartColors.secondary, strokeWidth: 2 }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="Đơn_hàng"
                                                            name="Đơn hàng"
                                                            stroke={chartColors.tertiary}
                                                            strokeWidth={3}
                                                            dot={{ fill: chartColors.tertiary, strokeWidth: 2, r: 6 }}
                                                            activeDot={{ r: 8, stroke: chartColors.tertiary, strokeWidth: 2 }}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </TabPane>

                                        <TabPane tab="Biểu đồ tròn" key="3">
                                            <div className="mt-4">
                                                <h3 className="text-xl font-semibold mb-6 text-center">Phân bố tổng quan (30 ngày)</h3>
                                                <div className="flex justify-center">
                                                    <ResponsiveContainer width="100%" height={400}>
                                                        <PieChart>
                                                            <Pie
                                                                data={pieChartData}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                                outerRadius={120}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                            >
                                                                {pieChartData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip content={<CustomTooltip />} />
                                                            <Legend
                                                                wrapperStyle={{ paddingTop: '20px' }}
                                                                iconType="circle"
                                                            />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </TabPane>

                                        <TabPane tab="Biểu đồ vùng" key="4">
                                            <div className="mt-4">
                                                <h3 className="text-xl font-semibold mb-6 text-center">Tổng quan theo thời gian</h3>
                                                <ResponsiveContainer width="100%" height={400}>
                                                    <AreaChart data={areaChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                        <XAxis
                                                            dataKey="period"
                                                            tick={{ fontSize: 14, fill: '#666' }}
                                                            axisLine={{ stroke: '#ddd' }}
                                                        />
                                                        <YAxis
                                                            tick={{ fontSize: 12, fill: '#666' }}
                                                            axisLine={{ stroke: '#ddd' }}
                                                        />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Legend
                                                            wrapperStyle={{ paddingTop: '20px' }}
                                                            iconType="line"
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="Người dùng"
                                                            stackId="1"
                                                            stroke={chartColors.primary}
                                                            fill={chartColors.primary}
                                                            fillOpacity={0.6}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="Sản phẩm"
                                                            stackId="1"
                                                            stroke={chartColors.secondary}
                                                            fill={chartColors.secondary}
                                                            fillOpacity={0.6}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="Đơn hàng"
                                                            stackId="1"
                                                            stroke={chartColors.tertiary}
                                                            fill={chartColors.tertiary}
                                                            fillOpacity={0.6}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </TabPane>
                                    </Tabs>
                                </Card>
                            </>
                        ) : (
                            <div className="text-red-500 text-center py-8">
                                <div className="text-2xl mb-2">⚠️</div>
                                Không thể tải thống kê. Vui lòng thử lại sau.
                            </div>
                        )}
                    </div>
                );
        }
    };

    const menuItems = [
        {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: "Tổng quan",
        },
        {
            key: "users",
            icon: <UserOutlined />,
            label: "Quản lý người dùng",
        },
        {
            key: "orders",
            icon: <ShoppingOutlined />,
            label: "Quản lý đơn hàng",
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider width={250} theme="light" style={{ borderRight: "1px solid #f0f0f0" }}>
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
                    <p className="text-sm text-gray-500">{user?.name}</p>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    items={menuItems}
                    onClick={({ key }) => setSelectedKey(key)}
                    style={{ borderRight: 0 }}
                />
            </Sider>
            <Layout>
                <Content style={{ padding: "24px", backgroundColor: "#f5f5f5" }}>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        {renderContent()}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminDashboard; 