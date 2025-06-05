import { Link } from "react-router-dom";

const PetCard = ({ pet }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getSpeciesIcon = (species) => {
    const icons = {
      dog: "🐕",
      cat: "🐱",
      bird: "🐦",
      fish: "🐠",
      rabbit: "🐰",
      hamster: "🐹",
      other: "🐾",
    };
    return icons[species] || "🐾";
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={pet.images?.[0]?.url || "/placeholder.svg?height=200&width=300"}
          alt={pet.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-white px-2 py-1 rounded-full text-sm font-medium">
            {getSpeciesIcon(pet.species)} {pet.species}
          </span>
        </div>
        {pet.isForAdoption && (
          <div className="absolute top-2 right-2">
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Nhận nuôi
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {pet.name}
          </h3>
          <span className="text-sm text-gray-500 ml-2">
            {getSizeLabel(pet.size)}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          {pet.breed} • {pet.gender === "male" ? "Đực" : "Cái"}
        </p>

        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {pet.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-500">
            <svg
              className="w-4 h-4 mr-1"
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
            {pet.location?.city || "Chưa cập nhật"}
          </div>

          {pet.healthStatus?.vaccinated && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              ✓ Đã tiêm phòng
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">
            {pet.isForAdoption ? (
              <span className="text-green-600">Miễn phí</span>
            ) : (
              formatPrice(pet.price)
            )}
          </div>

          <Link
            to={`/pets/${pet._id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PetCard;
