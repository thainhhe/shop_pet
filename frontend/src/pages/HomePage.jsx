import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Kết nối yêu thương với thú cưng
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              PetConnect - Nền tảng kết nối cửa hàng thú cưng, trung tâm cứu hộ
              và người yêu thú cưng. Tìm kiếm, mua bán và nhận nuôi thú cưng một
              cách an toàn và minh bạch.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/pets"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Khám phá thú cưng
              </Link>
              <Link
                to="/pets"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Nhận nuôi ngay
              </Link>
              <a
                href="/chat"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Go to Chat
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn PetConnect?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cung cấp một nền tảng toàn diện để bạn tìm kiếm, chăm
              sóc và kết nối với thú cưng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-xl font-semibold mb-2">Cửa hàng uy tín</h3>
              <p className="text-gray-600">
                Kết nối với các cửa hàng thú cưng uy tín, đảm bảo chất lượng và
                nguồn gốc rõ ràng
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-4xl mb-4">🏥</div>
              <h3 className="text-xl font-semibold mb-2">Trung tâm cứu hộ</h3>
              <p className="text-gray-600">
                Hỗ trợ các trung tâm cứu hộ trong việc tìm kiếm gia đình mới cho
                thú cưng
              </p>
            </div>

            <div className="text-center p-6">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI thông minh</h3>
              <p className="text-gray-600">
                Gợi ý thú cưng phù hợp dựa trên lối sống và điều kiện sống của
                bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Thú cưng</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Cửa hàng</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Trung tâm cứu hộ</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">2000+</div>
              <div className="text-gray-600">Người dùng</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Sẵn sàng tìm kiếm người bạn mới?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Tham gia cộng đồng PetConnect ngay hôm nay để khám phá thế giới thú
            cưng đầy yêu thương
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Đăng ký miễn phí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
