import { Link } from "react-router-dom";

const PetCard = ({ pet }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={pet.images?.[0]?.url || "/placeholder.svg?height=200&width=300"}
        alt={pet.name}
        className="w-full h-48 object-cover"
        onError={(e) =>
          console.log(
            `Error loading image for pet ${pet._id}:`,
            pet.images?.[0]?.url
          )
        }
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{pet.name}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {pet.breed} • {pet.gender === "male" ? "Đực" : "Cái"}
        </p>

        {/* Transaction type and price */}
        <div className="flex items-center justify-between mb-3">
          {pet.isForAdoption ? (
            <div className="flex items-center text-green-600">
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-sm font-medium">Nhận nuôi</span>
            </div>
          ) : (
            <div className="flex items-center text-blue-600">
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              <span className="text-sm font-medium">Mua bán</span>
            </div>
          )}

          <div className="text-right">
            {pet.isForAdoption ? (
              <span className="text-lg font-bold text-green-600">Miễn phí</span>
            ) : (
              <span className="text-lg font-bold text-blue-600">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(pet.price)}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {pet.description}
        </p>

        {/* Owner type badge */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              pet.ownerType === "shop"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {pet.ownerType === "shop" ? "Cửa hàng" : "Trung tâm cứu hộ"}
          </span>

          <span className="text-xs text-gray-500">
            {new Date(pet.createdAt).toLocaleDateString("vi-VN")}
          </span>
        </div>

        {/* Add View Details Button */}
        <Link
          to={`/pets/${pet._id}`}
          className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
};

export default PetCard;
