"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { petsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

const PetForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    breed: "",
    age: {
      value: "",
      unit: "months",
    },
    gender: "male",
    size: "medium",
    color: "",
    weight: "",
    description: "",
    personality: [],
    healthStatus: {
      vaccinated: false,
      neutered: false,
      healthCertificate: "",
      medicalHistory: "",
    },
    price: user?.role === "rescue_center" ? "0" : "",
    isForAdoption: user?.role === "rescue_center",
    isForSale: user?.role === "shop_owner",
    location: {
      city: "",
      district: "",
    },
    adoptionRequirements: {
      minAge: "",
      experienceRequired: false,
      homeVisit: false,
      followUpRequired: false,
    },
  });

  const [personalityInput, setPersonalityInput] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (isEdit && id) {
      fetchPetData();
    }
  }, [isEdit, id]);

  const fetchPetData = async () => {
    try {
      setLoading(true);
      const response = await petsAPI.getPet(id);
      const pet = response.data.pet;

      console.log("=== FETCH PET DEBUG ===");
      console.log("Pet data:", pet);
      console.log("Pet owner:", pet.owner);
      console.log("Current user:", user);

      setFormData({
        ...pet,
        age: pet.age || { value: "", unit: "months" },
        healthStatus: pet.healthStatus || {
          vaccinated: false,
          neutered: false,
          healthCertificate: "",
          medicalHistory: "",
        },
        location: pet.location || { city: "", district: "" },
        adoptionRequirements: pet.adoptionRequirements || {
          minAge: "",
          experienceRequired: false,
          homeVisit: false,
          followUpRequired: false,
        },
      });
      setExistingImages(pet.images || []);
    } catch (err) {
      console.error("Fetch pet error:", err);
      setError("Không thể tải thông tin thú cưng");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handlePersonalityAdd = () => {
    if (
      personalityInput.trim() &&
      !formData.personality.includes(personalityInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        personality: [...prev.personality, personalityInput.trim()],
      }));
      setPersonalityInput("");
    }
  };

  const handlePersonalityRemove = (trait) => {
    setFormData((prev) => ({
      ...prev,
      personality: prev.personality.filter((p) => p !== trait),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("=== SUBMIT DEBUG ===");
      console.log("Is edit:", isEdit);
      console.log("Pet ID:", id);
      console.log("Current user:", user);
      console.log(
        "Token:",
        localStorage.getItem("token") ? "exists" : "missing"
      );

      // Kiểm tra dữ liệu đầu vào
      if (!formData.name || !formData.breed || !formData.description) {
        setError("Vui lòng điền đầy đủ các trường bắt buộc: tên, giống, mô tả");
        setLoading(false);
        return;
      }
      if (
        user?.role === "shop_owner" &&
        (!formData.price || isNaN(formData.price))
      ) {
        setError("Vui lòng nhập giá bán hợp lệ");
        setLoading(false);
        return;
      }

      // Kiểm tra token
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        setLoading(false);
        navigate("/login");
        return;
      }

      // Prepare form data for submission
      const submitData = new FormData();

      // Add basic fields
      submitData.append("name", formData.name);
      submitData.append("species", formData.species);
      submitData.append("breed", formData.breed);
      submitData.append("gender", formData.gender);
      submitData.append("size", formData.size);
      submitData.append("color", formData.color || "");
      submitData.append("description", formData.description);

      // Auto-set transaction type based on user role
      const isShopOwner = user?.role === "shop_owner";
      const isRescueCenter = user?.role === "rescue_center";

      submitData.append("isForSale", isShopOwner ? "true" : "false");
      submitData.append("isForAdoption", isRescueCenter ? "true" : "false");

      // Add price (0 for rescue centers, actual price for shops)
      const price = isRescueCenter ? 0 : Number(formData.price) || 0;
      submitData.append("price", price);

      // Add weight if provided
      if (formData.weight) {
        submitData.append("weight", Number(formData.weight));
      }

      // Add complex objects as JSON strings
      submitData.append(
        "age",
        JSON.stringify({
          value: Number(formData.age.value) || 0,
          unit: formData.age.unit,
        })
      );

      submitData.append("healthStatus", JSON.stringify(formData.healthStatus));
      submitData.append("location", JSON.stringify(formData.location));
      submitData.append("personality", JSON.stringify(formData.personality));

      // Add adoption requirements only for rescue centers
      if (isRescueCenter) {
        submitData.append(
          "adoptionRequirements",
          JSON.stringify({
            ...formData.adoptionRequirements,
            minAge: formData.adoptionRequirements.minAge
              ? Number(formData.adoptionRequirements.minAge)
              : undefined,
          })
        );
      }

      // Add image files
      if (imageFiles.length > 0) {
        Array.from(imageFiles).forEach((file) => {
          submitData.append("images", file);
        });
      }

      console.log("FormData entries:", [...submitData.entries()]);

      let response;
      if (isEdit) {
        // For edit, use petsAPI.updatePetWithImages
        response = await petsAPI.updatePetWithImages(id, submitData);
      } else {
        // For create, use petsAPI.createPetWithImages
        response = await petsAPI.createPetWithImages(submitData);
      }

      console.log("Success response:", response.data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Submit error:", err);
      const errorMessage =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        "Có lỗi xảy ra khi lưu thông tin thú cưng";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEdit ? "Chỉnh sửa thú cưng" : "Thêm thú cưng mới"}
          </h1>
          <p className="text-gray-600">
            Điền đầy đủ thông tin để tạo hồ sơ thú cưng
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên thú cưng *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên thú cưng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loài *
                </label>
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dog">Chó</option>
                  <option value="cat">Mèo</option>
                  <option value="bird">Chim</option>
                  <option value="fish">Cá</option>
                  <option value="rabbit">Thỏ</option>
                  <option value="hamster">Chuột hamster</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giống *
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập giống thú cưng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Đực</option>
                  <option value="female">Cái</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kích thước *
                </label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">Nhỏ</option>
                  <option value="medium">Trung bình</option>
                  <option value="large">Lớn</option>
                  <option value="extra_large">Rất lớn</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu sắc
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Màu sắc chủ đạo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tuổi
                  </label>
                  <input
                    type="number"
                    name="age.value"
                    value={formData.age.value}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Số tuổi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đơn vị
                  </label>
                  <select
                    name="age.unit"
                    value={formData.age.unit}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="months">Tháng</option>
                    <option value="years">Năm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cân nặng (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Cân nặng"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Mô tả</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mô tả tính cách, đặc điểm, sở thích của thú cưng..."
              />
            </div>

            {/* Personality */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tính cách
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={personalityInput}
                  onChange={(e) => setPersonalityInput(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Thêm đặc điểm tính cách"
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handlePersonalityAdd())
                  }
                />
                <button
                  type="button"
                  onClick={handlePersonalityAdd}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.personality.map((trait, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {trait}
                    <button
                      type="button"
                      onClick={() => handlePersonalityRemove(trait)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Health Status */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Tình trạng sức khỏe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="healthStatus.vaccinated"
                    checked={formData.healthStatus.vaccinated}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Đã tiêm phòng
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="healthStatus.neutered"
                    checked={formData.healthStatus.neutered}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Đã triệt sản
                  </span>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giấy chứng nhận sức khỏe
                  </label>
                  <input
                    type="text"
                    name="healthStatus.healthCertificate"
                    value={formData.healthStatus.healthCertificate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Số giấy chứng nhận"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lịch sử y tế
                  </label>
                  <textarea
                    name="healthStatus.medicalHistory"
                    value={formData.healthStatus.medicalHistory}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Lịch sử bệnh, điều trị..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Price and Type */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Giá và loại giao dịch
            </h2>

            {/* Display transaction type based on user role */}
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              {user?.role === "shop_owner" ? (
                <div className="flex items-center text-blue-600">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  <span className="font-medium">
                    Cửa hàng - Thú cưng để bán
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-green-600">
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
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="font-medium">
                    Trung tâm cứu hộ - Thú cưng để nhận nuôi
                  </span>
                </div>
              )}
            </div>

            {/* Price input only for shop owners */}
            {user?.role === "shop_owner" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá bán (VNĐ) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập giá bán"
                />
              </div>
            )}

            {/* Info for rescue centers */}
            {user?.role === "rescue_center" && (
              <div className="text-sm text-gray-600">
                <p>
                  💡 Thú cưng từ trung tâm cứu hộ sẽ được đăng miễn phí để nhận
                  nuôi.
                </p>
                <p>Bạn có thể thiết lập yêu cầu nhận nuôi ở phần dưới.</p>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Địa điểm</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thành phố
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Thành phố"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  name="location.district"
                  value={formData.location.district}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Quận/Huyện"
                />
              </div>
            </div>
          </div>

          {/* Adoption Requirements (only for adoption) */}
          {user?.role === "rescue_center" && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Yêu cầu nhận nuôi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tuổi tối thiểu của người nhận nuôi
                  </label>
                  <input
                    type="number"
                    name="adoptionRequirements.minAge"
                    value={formData.adoptionRequirements.minAge}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tuổi tối thiểu"
                  />
                </div>

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="adoptionRequirements.experienceRequired"
                      checked={formData.adoptionRequirements.experienceRequired}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Yêu cầu kinh nghiệm nuôi thú cưng
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="adoptionRequirements.homeVisit"
                      checked={formData.adoptionRequirements.homeVisit}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Yêu cầu thăm nhà
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="adoptionRequirements.followUpRequired"
                      checked={formData.adoptionRequirements.followUpRequired}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Yêu cầu theo dõi sau nhận nuôi
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Images */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Hình ảnh</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn hình ảnh
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Chọn nhiều hình ảnh để tạo gallery cho thú cưng
              </p>
            </div>

            {/* Existing Images Preview */}
            {existingImages.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh hiện tại:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={
                          image.url || "/placeholder.svg?height=100&width=100"
                        }
                        alt={`Pet ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Preview */}
            {imageFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh mới:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from(imageFiles).map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file) || "/placeholder.svg"}
                        alt={`New ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PetForm;
