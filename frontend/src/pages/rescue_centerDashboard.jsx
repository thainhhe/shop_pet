import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button, Modal } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Import components
import StatsCards from '../components/rescueCenter/StatsCards';
import DateFilter from '../components/rescueCenter/DateFilter';
import AdoptionRequestsTable from '../components/rescueCenter/AdoptionRequestsTable';
import PetsTable from '../components/rescueCenter/PetsTable';

// Cấu hình dayjs
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');

function RescueCenterDashboard() {
    const [stats, setStats] = useState(null);
    const [pets, setPets] = useState([]);
    const [adoptionRequests, setAdoptionRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination states for pets
    const [petsCurrentPage, setPetsCurrentPage] = useState(1);
    const [petsPageSize, setPetsPageSize] = useState(10);

    // Pagination states for adoption requests
    const [adoptionCurrentPage, setAdoptionCurrentPage] = useState(1);
    const [adoptionPageSize, setAdoptionPageSize] = useState(10);

    // Date filtering states
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [dateRange, setDateRange] = useState(null);
    const [dateFilterType, setDateFilterType] = useState('month'); // 'month' or 'range'

    // Status filtering
    const [petsStatusFilter, setPetsStatusFilter] = useState('all');
    const [adoptionStatusFilter, setAdoptionStatusFilter] = useState('all');

    const { token } = useAuth();

    const fetchData = async () => {
        if (!token) {
            setError("Authentication token not found.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };

            // Fetch rescue center specific data using existing APIs
            const [statsRes, petsRes, adoptionRequestsRes] = await Promise.all([
                api.get('/shop/rescue-stats', config),
                api.get('/shop/rescue-pets', config),
                api.get('/adoptions/requests', config)
            ]);

            console.log('Adoption requests response:', adoptionRequestsRes.data);

            setStats(statsRes.data);
            setPets(petsRes.data || []);

            // Handle different response formats for adoption requests
            let adoptionData = [];
            if (adoptionRequestsRes.data && adoptionRequestsRes.data.applications) {
                adoptionData = adoptionRequestsRes.data.applications;
            } else if (Array.isArray(adoptionRequestsRes.data)) {
                adoptionData = adoptionRequestsRes.data;
            }

            setAdoptionRequests(adoptionData);
            console.log('Processed adoption requests:', adoptionData);

            // Get pending requests count from adoption requests
            const pendingRequests = adoptionData.filter(app => app.status === 'pending').length || 0;

            // Update stats with pending requests
            setStats(prevStats => ({
                ...prevStats,
                pendingRequests
            }));

            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || "An error occurred while fetching dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleDeletePet = async (petId) => {
        Modal.confirm({
            title: 'Bạn có chắc chắn muốn xóa thú cưng này?',
            content: 'Hành động này không thể hoàn tác.',
            okText: 'Có',
            okType: 'danger',
            cancelText: 'Không',
            onOk: async () => {
                try {
                    await api.delete(`/pets/${petId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    fetchData();
                } catch (err) {
                    Modal.error({
                        title: 'Lỗi',
                        content: err.response?.data?.message || 'Không thể xóa thú cưng.',
                    });
                }
            },
        });
    };

    const handleUpdateAdoptionStatus = async (adoptionId, status, notes = '') => {
        try {
            await api.put(`/adoptions/${adoptionId}/status`, { status, notes }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            Modal.error({
                title: 'Lỗi',
                content: err.response?.data?.message || 'Không thể cập nhật trạng thái nhận nuôi.',
            });
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
        if (petsStatusFilter !== 'all') {
            statusMatch = pet.status === petsStatusFilter;
        }

        return dateMatch && statusMatch;
    });

    // Filter adoption requests by date and status
    const filteredAdoptionRequests = adoptionRequests.filter(request => {
        // Date filtering
        let dateMatch = true;
        if (dateFilterType === 'month' && selectedMonth) {
            const requestDate = dayjs(request.createdAt);
            dateMatch = requestDate.isSame(selectedMonth, 'month');
        } else if (dateFilterType === 'range' && dateRange && dateRange.length === 2) {
            const requestDate = dayjs(request.createdAt);
            dateMatch = requestDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
        }

        // Status filtering
        let statusMatch = true;
        if (adoptionStatusFilter !== 'all') {
            statusMatch = request.status === adoptionStatusFilter;
        }

        return dateMatch && statusMatch;
    });

    // Calculate stats for filtered data
    const filteredStats = {
        totalPets: filteredPets.length,
        availablePets: filteredPets.filter(pet => pet.status === 'available').length,
        pendingPets: filteredPets.filter(pet => pet.status === 'pending').length,
        adoptedPets: filteredPets.filter(pet => pet.status === 'adopted').length,
        totalRequests: filteredAdoptionRequests.length,
        pendingRequests: filteredAdoptionRequests.filter(req => req.status === 'pending').length,
        approvedRequests: filteredAdoptionRequests.filter(req => req.status === 'approved').length,
        rejectedRequests: filteredAdoptionRequests.filter(req => req.status === 'rejected').length,
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
        setPetsCurrentPage(1);
        setAdoptionCurrentPage(1);
    };

    const handleStatusFilterChange = (type, value) => {
        if (type === 'pets') {
            setPetsStatusFilter(value);
            setPetsCurrentPage(1);
        } else {
            setAdoptionStatusFilter(value);
            setAdoptionCurrentPage(1);
        }
    };

    const handlePetsPageChange = (page, size) => {
        setPetsCurrentPage(page);
        setPetsPageSize(size);
    };

    const handleAdoptionPageChange = (page, size) => {
        setAdoptionCurrentPage(page);
        setAdoptionPageSize(size);
    };

    if (loading) {
        return <div className="text-center p-8">Đang tải Dashboard...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Lỗi: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard Trung tâm Cứu hộ</h1>
                    <p className="text-gray-600 mt-1">Quản lý thú cưng và đơn nhận nuôi</p>
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchData}
                    loading={loading}
                >
                    Làm mới
                </Button>
            </div>

            {/* Date Filter Controls */}
            <DateFilter
                dateFilterType={dateFilterType}
                selectedMonth={selectedMonth}
                dateRange={dateRange}
                onDateFilterChange={handleDateFilterChange}
            />

            {/* Stats */}
            <StatsCards stats={filteredStats} />

            {/* Adoption Requests Table */}
            <AdoptionRequestsTable
                adoptionRequests={adoptionRequests}
                filteredAdoptionRequests={filteredAdoptionRequests}
                loading={loading}
                currentPage={adoptionCurrentPage}
                pageSize={adoptionPageSize}
                statusFilter={adoptionStatusFilter}
                onStatusFilterChange={(value) => handleStatusFilterChange('adoption', value)}
                onPageChange={handleAdoptionPageChange}
                onUpdateStatus={handleUpdateAdoptionStatus}
            />

            {/* Pets Table */}
            <PetsTable
                pets={pets}
                filteredPets={filteredPets}
                loading={loading}
                currentPage={petsCurrentPage}
                pageSize={petsPageSize}
                statusFilter={petsStatusFilter}
                onStatusFilterChange={(value) => handleStatusFilterChange('pets', value)}
                onPageChange={handlePetsPageChange}
                onDeletePet={handleDeletePet}
            />
        </div>
    );
}

export default RescueCenterDashboard;
