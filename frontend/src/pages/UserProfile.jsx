import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      district: '',
      ward: '',
      zipCode: ''
    },
    profile: {
      lifestyle: 'moderate',
      livingSpace: 'apartment',
      experience: 'beginner',
      preferences: {
        petTypes: [],
        sizes: [],
        ages: []
      }
    }
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUserProfile();
      setUserProfile(response.data.user);
      setFormData({
        name: response.data.user.name || '',
        phone: response.data.user.phone || '',
        address: {
          street: response.data.user.address?.street || '',
          city: response.data.user.address?.city || '',
          district: response.data.user.address?.district || '',
          ward: response.data.user.address?.ward || '',
          zipCode: response.data.user.address?.zipCode || ''
        },
        profile: {
          lifestyle: response.data.user.profile?.lifestyle || 'moderate',
          livingSpace: response.data.user.profile?.livingSpace || 'apartment',
          experience: response.data.user.profile?.experience || 'beginner',
          preferences: {
            petTypes: response.data.user.profile?.preferences?.petTypes || [],
            sizes: response.data.user.profile?.preferences?.sizes || [],
            ages: response.data.user.profile?.preferences?.ages || []
          }
        }
      });
    } catch (err) {
      setError('Không thể tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      const response = await authAPI.updateProfile(formData);
      setUserProfile(response.data.user);
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Không thể cập nhật hồ sơ');
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'user': 'Người dùng',
      'shop_owner': 'Chủ cửa hàng',
      'rescue_center': 'Trung tâm cứu hộ',
      'admin': 'Quản trị viên'
    };
    return roleNames[role] || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center">
                {userProfile?.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-600">
                    {userProfile?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{userProfile?.name}</h1>
                <p className="text-blue-100">{getRoleDisplayName(userProfile?.role)}</p>
                <p className="text-blue-100 text-sm">
                  Tham gia từ {formatDate(userProfile?.createdAt)}
                </p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {!isEditing ? (
              // View Mode
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    Thông tin cơ bản
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{userProfile?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                      <p className="mt-1 text-sm text-gray-900">{userProfile?.phone || 'Chưa cung cấp'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Trạng thái xác thực</label>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userProfile?.isVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {userProfile?.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    Địa chỉ
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Đường</label>
                      <p className="mt-1 text-sm text-gray-900">{userProfile?.address?.street || 'Chưa cung cấp'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Thành phố</label>
                      <p className="mt-1 text-sm text-gray-900">{userProfile?.address?.city || 'Chưa cung cấp'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quận/Huyện</label>
                      <p className="mt-1 text-sm text-gray-900">{userProfile?.address?.district || 'Chưa cung cấp'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phường/Xã</label>
                      <p className="mt-1 text-sm text-gray-900">{userProfile?.address?.ward || 'Chưa cung cấp'}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="space-y-4 md:col-span-2">
                  <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    Thông tin hồ sơ
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Lối sống</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{userProfile?.profile?.lifestyle || 'Chưa cung cấp'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Không gian sống</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{userProfile?.profile?.livingSpace || 'Chưa cung cấp'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kinh nghiệm</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{userProfile?.profile?.experience || 'Chưa cung cấp'}</p>
                    </div>
                  </div>
                </div>

                {/* Premium Subscription */}
                {userProfile?.premiumSubscription && (
                  <div className="space-y-4 md:col-span-2">
                    <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                      Gói Premium
                    </h2>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        Trạng thái: {userProfile.premiumSubscription.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                      </p>
                      {userProfile.premiumSubscription.expiresAt && (
                        <p className="text-sm text-yellow-800">
                          Hết hạn: {formatDate(userProfile.premiumSubscription.expiresAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                      Thông tin cơ bản
                    </h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tên</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                      Địa chỉ
                    </h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Đường</label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Thành phố</label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quận/Huyện</label>
                      <input
                        type="text"
                        name="address.district"
                        value={formData.address.district}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phường/Xã</label>
                      <input
                        type="text"
                        name="address.ward"
                        value={formData.address.ward}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    Thông tin hồ sơ
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Lối sống</label>
                      <select
                        name="profile.lifestyle"
                        value={formData.profile.lifestyle}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Năng động</option>
                        <option value="moderate">Vừa phải</option>
                        <option value="quiet">Yên tĩnh</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Không gian sống</label>
                      <select
                        name="profile.livingSpace"
                        value={formData.profile.livingSpace}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="apartment">Căn hộ</option>
                        <option value="house">Nhà riêng</option>
                        <option value="farm">Trang trại</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kinh nghiệm</label>
                      <select
                        name="profile.experience"
                        value={formData.profile.experience}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">Người mới</option>
                        <option value="intermediate">Có kinh nghiệm</option>
                        <option value="expert">Chuyên gia</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updateLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
