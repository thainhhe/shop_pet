"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { petsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";
import api from "../../services/api";

const PetManagement = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const { token } = useAuth();

  useEffect(() => {
    fetchMyPets();
  }, [filter]);

  const fetchMyPets = async () => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await api.get("/shop/pets", config);
      setPets(response.data);
    } catch (err) {
      setError("Không thể tải danh sách thú cưng");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (petId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thú cưng này?")) {
      try {
        await petsAPI.deletePet(petId);
        setPets(pets.filter((pet) => pet._id !== petId));
      } catch (err) {
        alert("Không thể xóa thú cưng");
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      adopted: "bg-blue-100 text-blue-800",
      sold: "bg-gray-100 text-gray-800",
    };
    const labels = {
      available: "Có sẵn",
      pending: "Đang chờ",
      adopted: "Đã nhận nuôi",
      sold: "Đã bán",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

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
        <Link
          to="/pets/new"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Thêm thú cưng mới
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: "all", label: "Tất cả" },
              { key: "available", label: "Có sẵn" },
              { key: "pending", label: "Đang chờ" },
              { key: "sold", label: "Đã bán" },
              { key: "adopted", label: "Đã nhận nuôi" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Pet List */}
      {pets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có thú cưng nào
          </h3>
          <p className="text-gray-500 mb-4">
            Bắt đầu bằng cách thêm thú cưng đầu tiên của bạn
          </p>
          <Link
            to="/pets/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Thêm thú cưng mới
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thú cưng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pets.map((pet) => (
                <tr key={pet._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={
                          pet.images?.[0]?.url ||
                          "/placeholder.svg?height=48&width=48"
                        }
                        alt={pet.name}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {pet.name}
                        </div>
                        <div className="text-sm text-gray-500">{pet.breed}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pet.species}</div>
                    <div className="text-sm text-gray-500">
                      {pet.gender === "male" ? "Đực" : "Cái"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pet.isForAdoption ? (
                        <span className="text-green-600 font-medium">
                          Miễn phí
                        </span>
                      ) : (
                        formatPrice(pet.price)
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(pet.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pet.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/pets/${pet._id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </Link>
                      <Link
                        to={`/pets/${pet._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Chỉnh sửa"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(pet._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PetManagement;
