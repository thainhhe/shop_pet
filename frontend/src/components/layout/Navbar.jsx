"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CartIcon from "../cart/CartIcon";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Đóng tất cả các menu đang mở
  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeAllMenus(); // Đảm bảo đóng menu sau khi logout
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-lg relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* === Phần bên trái: Logo & Các liên kết Desktop === */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex-shrink-0 flex items-center"
              onClick={closeAllMenus}
            >
              <span className="text-2xl font-bold text-blue-600">
                🐾 PetConnect
              </span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/pets"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Thú cưng
              </Link>
              <Link
                to="/products"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sản phẩm
              </Link>
              <Link
                to="/recommendations"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                🤖 Gợi ý AI
              </Link>
            </div>
          </div>

          {/* === Phần bên phải: Icons & Menu người dùng (Desktop) === */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <CartIcon />
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={
                        user?.avatar ||
                        `https://ui-avatars.com/api/?name=${user?.name}&background=random`
                      }
                      alt={user?.name || "User Avatar"}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-3 text-sm text-gray-700 border-b">
                        <p className="font-semibold truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        {user?.role === "admin" && (
                          <Link
                            to="/admin-dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeAllMenus}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        {user?.role === "shop_owner" && (
                          <Link
                            to="/shop-dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeAllMenus}
                          >
                            Shop Dashboard
                          </Link>
                        )}
                        {user?.role === "rescue_center" && (
                          <Link
                            to="/rescue-dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeAllMenus}
                          >
                            Rescue Dashboard
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={closeAllMenus}
                        >
                          Hồ sơ cá nhân
                        </Link>
                        {user?.role === "user" && (
                          <Link
                            to="/orders"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeAllMenus}
                          >
                            Đơn hàng của tôi
                          </Link>
                        )}
                        <Link
                          to="/profile/preferences"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={closeAllMenus}
                        >
                          Cập nhật sở thích
                        </Link>
                      </div>
                      <div className="py-1 border-t border-gray-200">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* === Nút Hamburger & Cart Icon (Mobile) === */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && <CartIcon />}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m4 6H4"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* === Panel Menu Mobile === */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
            <Link
              to="/pets"
              className="text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
              onClick={closeAllMenus}
            >
              Thú cưng
            </Link>
            <Link
              to="/products"
              className="text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
              onClick={closeAllMenus}
            >
              Sản phẩm
            </Link>
            <Link
              to="/recommendations"
              className="text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
              onClick={closeAllMenus}
            >
              Gợi ý AI
            </Link>

            <div className="border-t border-gray-200 pt-4 mt-4">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="px-3 mb-2">
                    <p className="text-base font-semibold text-gray-800">
                      {user?.name}
                    </p>
                    <p className="text-sm font-medium text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  {user?.role === "admin" && (
                    <Link
                      to="/admin-dashboard"
                      className="text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={closeAllMenus}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {user?.role === "shop_owner" && (
                    <Link
                      to="/shop-dashboard"
                      className="text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={closeAllMenus}
                    >
                      Shop Dashboard
                    </Link>
                  )}
                  {user?.role === "rescue_center" && (
                    <Link
                      to="/rescue-dashboard"
                      className="text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={closeAllMenus}
                    >
                      Rescue Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeAllMenus}
                  >
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    to="/orders"
                    className="text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeAllMenus}
                  >
                    Đơn hàng
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/login"
                    className="text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeAllMenus}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeAllMenus}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
