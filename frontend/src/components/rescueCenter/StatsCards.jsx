import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
    HeartOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined
} from '@ant-design/icons';

const StatsCards = ({ stats }) => {
    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Tổng thú cưng"
                        value={stats?.totalPets || 0}
                        prefix={<HeartOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Có sẵn"
                        value={stats?.availablePets || 0}
                        valueStyle={{ color: '#3f8600' }}
                        prefix={<CheckCircleOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Đang chờ"
                        value={stats?.pendingPets || 0}
                        valueStyle={{ color: '#faad14' }}
                        prefix={<ClockCircleOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card>
                    <Statistic
                        title="Đã nhận nuôi"
                        value={stats?.adoptedPets || 0}
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<UserOutlined />}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default StatsCards; 