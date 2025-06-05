"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { petsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchPetDetail();
  }, [id]);

  const fetchPetDetail = async () => {
    try {
      setLoading(true);
      const response = await petsAPI.getPet(id);
      setPet(response.data.pet);
    } catch (err) {
      setError("Không thể tải thông tin thú cưng");
      console.error("Fetch pet detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getSpeciesLabel = (species) => {
    const labels = {
      dog: "Chó",
      cat: "Mèo",
      bird: "Chim",
      fish: "Cá",
      rabbit: "Thỏ",
      hamster: "Chuột hamster",
      other: "Khác",
    };
    return labels[species] || species;
  };

  const getSizeLabel = (size) => {
    const labels = {
      small: "Nhỏ",
      medium: "Trung bình",
      large: "Lớn",
      extra_large: "Rất lớn",
    };
    return labels[size] || size;
  };

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    // Implement contact functionality
    alert("Tính năng liên hệ sẽ được triển khai sau!");
  };

  const handleAdoptRequest = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    // Implement adoption request functionality
    alert("Tính năng đăng ký nhận nuôi sẽ được triển khai sau!");
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate("/pets")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/pets")}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Quay lại danh sách
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="mb-4">
            <img
              src={
                pet.images?.[currentImageIndex]?.url ||
                "/placeholder.svg?height=400&width=600"
              }
              alt={pet.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>

          {pet.images && pet.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {pet.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                    index === currentImageIndex
                      ? "border-blue-500"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={`${pet.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pet Information */}
        <div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
              {pet.isForAdoption && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Nhận nuôi
                </span>
              )}
            </div>

            <div className="text-2xl font-bold text-blue-600 mb-4">
              {pet.isForAdoption ? "Miễn phí" : formatPrice(pet.price)}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-sm text-gray-500">Loài:</span>
                <p className="font-medium">{getSpeciesLabel(pet.species)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Giống:</span>
                <p className="font-medium">{pet.breed}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Giới tính:</span>
                <p className="font-medium">
                  {pet.gender === "male" ? "Đực" : "Cái"}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Kích thước:</span>
                <p className="font-medium">{getSizeLabel(pet.size)}</p>
              </div>
              {pet.age && (
                <div>
                  <span className="text-sm text-gray-500">Tuổi:</span>
                  <p className="font-medium">
                    {pet.age.value}{" "}
                    {pet.age.unit === "months" ? "tháng" : "năm"}
                  </p>
                </div>
              )}
              {pet.weight && (
                <div>
                  <span className="text-sm text-gray-500">Cân nặng:</span>
                  <p className="font-medium">{pet.weight} kg</p>
                </div>
              )}
            </div>

            {/* Health Status */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Tình trạng sức khỏe
              </h3>
              <div className="flex flex-wrap gap-2">
                {pet.healthStatus?.vaccinated && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    ✓ Đã tiêm phòng
                  </span>
                )}
                {pet.healthStatus?.neutered && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    ✓ Đã triệt sản
                  </span>
                )}
                {!pet.healthStatus?.vaccinated &&
                  !pet.healthStatus?.neutered && (
                    <span className="text-gray-500 text-sm">
                      Chưa có thông tin
                    </span>
                  )}
              </div>
            </div>

            {/* Personality */}
            {pet.personality && pet.personality.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Tính cách</h3>
                <div className="flex flex-wrap gap-2">
                  {pet.personality.map((trait, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Mô tả</h3>
              <p className="text-gray-700 leading-relaxed">{pet.description}</p>
            </div>

            {/* Location */}
            {pet.location && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Địa điểm</h3>
                <div className="flex items-center text-gray-600">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {pet.location.city}
                  {pet.location.district && `, ${pet.location.district}`}
                </div>
              </div>
            )}

            {/* Owner Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Thông tin người bán
              </h3>
              <div className="flex items-center">
                <img
                  src={
                    pet.owner?.avatar || "/placeholder.svg?height=40&width=40"
                  }
                  alt={pet.owner?.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium">{pet.owner?.name}</p>
                  <p className="text-sm text-gray-500">
                    {pet.ownerType === "shop"
                      ? "Cửa hàng thú cưng"
                      : "Trung tâm cứu hộ"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {pet.isForAdoption ? (
                <button
                  onClick={handleAdoptRequest}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Đăng ký nhận nuôi
                </button>
              ) : (
                <button
                  onClick={handleContactOwner}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Liên hệ mua
                </button>
              )}

              <button
                onClick={handleContactOwner}
                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Nhắn tin cho người bán
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetail;
