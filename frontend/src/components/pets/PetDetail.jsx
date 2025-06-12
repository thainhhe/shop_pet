"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { petsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";
import AdoptionForm from "../adoption/AdoptionForm";
import { useCart } from "../../contexts/CartContext";

const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAdoptionForm, setShowAdoptionForm] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    fetchPetDetail();
  }, [id]);

  const fetchPetDetail = async () => {
    try {
      setLoading(true);
      const response = await petsAPI.getPet(id);
      if (!response.data?.pet) {
        throw new Error("Dữ liệu thú cưng không hợp lệ");
      }
      setPet(response.data.pet);
    } catch (err) {
      setError(
        err.response?.data?.message || "Không thể tải thông tin thú cưng"
      );
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

  const formatAge = (age) => {
    if (!age) return "Không có thông tin";
    if (age.unit === "months") {
      return `${age.value} tháng`;
    }
    return `${age.value} năm`;
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

  const getStatusColor = (status) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      pending_adoption: "bg-yellow-100 text-yellow-800",
      adopted: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      available: "Có thể nhận nuôi",
      pending_adoption: "Đang chờ nhận nuôi",
      adopted: "Đã được nhận nuôi",
    };
    return texts[status] || status;
  };

  const canAdopt = () => {
    return (
      isAuthenticated &&
      pet &&
      pet.isForAdoption &&
      pet.status === "available" &&
      pet.owner?._id !== user?.id
    );
  };

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    alert("Tính năng liên hệ sẽ được triển khai sau!");
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const result = await addToCart(pet._id, 1, "pet");
      if (result.success) {
        alert("Đã thêm vào giỏ hàng thành công!");
      } else {
        alert(result.error || "Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("lỗi Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
    }
  };

  const handleAdoptRequest = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setShowAdoptionForm(true);
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
          <div className="relative mb-4">
            <img
              src={
                pet.images?.[currentImageIndex]?.url ||
                "/placeholder.svg?height=400&width=600"
              }
              alt={pet.name}
              className="w-full h-96 object-cover rounded-lg"
              loading="lazy"
            />
            {pet.images && pet.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev > 0 ? prev - 1 : pet.images.length - 1
                    )
                  }
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  <svg
                    className="w-4 h-4"
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
                </button>
                <button
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev < pet.images.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>

          {pet.images && pet.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {pet.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${index === currentImageIndex
                    ? "border-blue-500"
                    : "border-gray-200"
                    }`}
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={`${pet.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
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
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    pet.status
                  )}`}
                >
                  {getStatusText(pet.status)}
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
                  <p className="font-medium">{formatAge(pet.age)}</p>
                </div>
              )}
              {pet.weight && (
                <div>
                  <span className="text-sm text-gray-500">Cân nặng:</span>
                  <p className="font-medium">{pet.weight} kg</p>
                </div>
              )}
              {pet.color && (
                <div>
                  <span className="text-sm text-gray-500">Màu sắc:</span>
                  <p className="font-medium">{pet.color}</p>
                </div>
              )}
            </div>

            {/* Health Status */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Tình trạng sức khỏe
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${pet.healthStatus?.vaccinated
                        ? "bg-green-500"
                        : "bg-red-500"
                        }`}
                    ></span>
                    <span>
                      {pet.healthStatus?.vaccinated
                        ? "Đã tiêm phòng"
                        : "Chưa tiêm phòng"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${pet.healthStatus?.neutered
                        ? "bg-green-500"
                        : "bg-red-500"
                        }`}
                    ></span>
                    <span>
                      {pet.healthStatus?.neutered
                        ? "Đã triệt sản"
                        : "Chưa triệt sản"}
                    </span>
                  </div>
                  {pet.healthStatus?.medicalHistory && (
                    <div className="mt-3 col-span-2">
                      <span className="font-medium">Lịch sử y tế:</span>
                      <p className="text-gray-700 mt-1">
                        {pet.healthStatus.medicalHistory}
                      </p>
                    </div>
                  )}
                </div>
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
              <div className="flex items-center bg-gray-50 p-4 rounded-lg">
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
                  <p className="text-sm text-gray-500">{pet.owner?.email}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {pet.isForAdoption ? (
                canAdopt() ? (
                  <button
                    onClick={handleAdoptRequest}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Gửi đơn xin nhận nuôi
                  </button>
                ) : (
                  !isAuthenticated && (
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Đăng nhập để nhận nuôi
                    </button>
                  )
                )
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    onClick={handleContactOwner}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Mua ngay
                  </button>
                </div>
              )}

              {pet.status !== "available" && pet.isForAdoption && (
                <div className="w-full bg-gray-300 text-gray-600 py-3 px-6 rounded-lg font-semibold text-center">
                  {pet.status === "adopted"
                    ? "Thú cưng đã được nhận nuôi"
                    : "Đang chờ xử lý nhận nuôi"}
                </div>
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

        {/* Adoption Form Modal */}
        {showAdoptionForm && (
          <AdoptionForm pet={pet} onClose={() => setShowAdoptionForm(false)} />
        )}
      </div>
    </div>
  );
};

export default PetDetail;
