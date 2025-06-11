"use client";

import { useState } from "react";
import { useAdoption } from "../../contexts/AdoptionContext";
import { useAuth } from "../../contexts/AuthContext";

const AdoptionForm = ({ pet, onClose }) => {
  const { user } = useAuth();
  const { submitApplication } = useAdoption();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    livingArrangement: "",
    hasOtherPets: false,
    otherPetsDetails: "",
    hasChildren: false,
    childrenAges: "",
    workSchedule: "",
    experience: "",
    reasonForAdoption: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    references: [
      {
        name: "",
        phone: "",
        relationship: "",
      },
    ],
    agreeToTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleReferenceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedReferences = [...formData.references];
    updatedReferences[index] = {
      ...updatedReferences[index],
      [name]: value,
    };

    setFormData({
      ...formData,
      references: updatedReferences,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      setError("Bạn phải đồng ý với các điều khoản và điều kiện");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Add user info to form data
      const applicationData = {
        ...formData,
        applicant: {
          name: user.name,
          email: user.email,
          phone: user.phone || "",
        },
      };

      const result = await submitApplication(pet._id, applicationData);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi gửi đơn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Đơn đăng ký đã được gửi!
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Cảm ơn bạn đã đăng ký nhận nuôi {pet.name}. Chúng tôi sẽ xem xét
              đơn của bạn và liên hệ trong thời gian sớm nhất.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={onClose}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Đơn đăng ký nhận nuôi {pet.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điều kiện sống của bạn
              </label>
              <select
                name="livingArrangement"
                value={formData.livingArrangement}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Chọn --</option>
                <option value="house">Nhà riêng</option>
                <option value="apartment">Căn hộ</option>
                <option value="condo">Chung cư</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bạn có thú cưng khác không?
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasOtherPets"
                    checked={formData.hasOtherPets}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Có</span>
                </label>
              </div>
            </div>

            {formData.hasOtherPets && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chi tiết về thú cưng hiện tại
                </label>
                <textarea
                  name="otherPetsDetails"
                  value={formData.otherPetsDetails}
                  onChange={handleChange}
                  required={formData.hasOtherPets}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Loại thú cưng, số lượng, tuổi, tính cách..."
                ></textarea>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bạn có con nhỏ không?
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasChildren"
                    checked={formData.hasChildren}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Có</span>
                </label>
              </div>
            </div>

            {formData.hasChildren && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tuổi của trẻ
                </label>
                <input
                  type="text"
                  name="childrenAges"
                  value={formData.childrenAges}
                  onChange={handleChange}
                  required={formData.hasChildren}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Ví dụ: 5, 7, 10 tuổi"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lịch làm việc của bạn
              </label>
              <select
                name="workSchedule"
                value={formData.workSchedule}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Chọn --</option>
                <option value="full_time">Toàn thời gian (8h/ngày)</option>
                <option value="part_time">Bán thời gian</option>
                <option value="work_from_home">Làm việc tại nhà</option>
                <option value="flexible">Linh hoạt</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kinh nghiệm nuôi thú cưng
              </label>
              <textarea
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Mô tả kinh nghiệm nuôi thú cưng của bạn..."
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do bạn muốn nhận nuôi {pet.name}
              </label>
              <textarea
                name="reasonForAdoption"
                value={formData.reasonForAdoption}
                onChange={handleChange}
                required
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Chia sẻ lý do bạn muốn nhận nuôi thú cưng này..."
              ></textarea>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Thông tin liên hệ khẩn cấp
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên
                </label>
                <input
                  type="text"
                  name="emergencyContact.name"
                  value={formData.emergencyContact.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="emergencyContact.phone"
                  value={formData.emergencyContact.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mối quan hệ
                </label>
                <input
                  type="text"
                  name="emergencyContact.relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Người tham khảo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.references[0].name}
                  onChange={(e) => handleReferenceChange(0, e)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.references[0].phone}
                  onChange={(e) => handleReferenceChange(0, e)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mối quan hệ
                </label>
                <input
                  type="text"
                  name="relationship"
                  value={formData.references[0].relationship}
                  onChange={(e) => handleReferenceChange(0, e)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="agreeToTerms"
                className="font-medium text-gray-700"
              >
                Tôi đồng ý với các điều khoản và điều kiện
              </label>
              <p className="text-gray-500">
                Tôi cam kết cung cấp thông tin chính xác và hiểu rằng việc cung
                cấp thông tin sai lệch có thể dẫn đến việc từ chối đơn đăng ký.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi đơn đăng ký"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdoptionForm;
