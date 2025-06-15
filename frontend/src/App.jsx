import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";
import PetList from "./components/pets/PetList";
import PetDetail from "./components/pets/PetDetail";
import PetForm from "./components/pets/PetForm";
import PetManagement from "./components/pets/PetManagement";
import ProductList from "./components/products/ProductList";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ShopDashboard from "./pages/ShopDashboard";
import CheckoutPage from "./components/checkout/CheckoutPage";
import OrderList from "./components/orders/OrderList";
import OrderDetail from "./components/orders/OrderDetail";

// Thêm import Footer
import Footer from "./components/layout/Footer";

// Add import for CartProvider and CartPage
import { CartProvider } from "./contexts/CartContext";
import CartPage from "./components/cart/CartPage";

// Wrap the Router with CartProvider:
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/pets" element={<PetList />} />
                <Route path="/pets/:id" element={<PetDetail />} />
                <Route path="/products" element={<ProductList />} />

                {/* Protected routes */}
                <Route
                  path="/shop-dashboard"
                  element={
                    <ProtectedRoute requiredRole={["shop_owner"]}>
                      <ShopDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrderList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/pets/new"
                  element={
                    <ProtectedRoute
                      requiredRole={["shop_owner", "rescue_center"]}
                    >
                      <PetForm />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/pets/:id/edit"
                  element={
                    <ProtectedRoute requiredRole={["shop_owner"]}>
                      <PetForm isEdit={true} />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/manage/pets"
                  element={
                    <ProtectedRoute requiredRole={["shop_owner", "admin"]}>
                      <PetManagement />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
