import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Adminauth from "./pages/Admin/Admin";
import AdminDashboard from "./pages/Admin/AdminDashBoard";
import { Toaster, toast } from "react-hot-toast";
import Footer from "./components/Footer";
import OrderSuccess from "./pages/Resaturent/OrderSuccess";
import TrackOrder from "./pages/TrackOrder";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";
import HelpPage from "./pages/HelpPage";
import ScrollToTop from "./components/ScrollToTop";
import RestaurantAuth from "./pages/Resaturent/RestaurantAuth";
import RestaurantDashboard from "./pages/Resaturent/RestaurantDashboard";
import PublicMenu from "./components/Restaurent/PublicMenu";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PendingApproval from "./pages/Resaturent/PendingApproval";

const App = () => {

  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu/:restaurantId/cart" element={<Cart />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy&policy" element={<PrivacyPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/admin/auth" element={<Adminauth />} />
        <Route path="/restaurant/auth" element={<RestaurantAuth />} />
        <Route
          path="/restaurant/pending-approval"
          element={
            <ProtectedRoute roleRequired="restaurant">
              <PendingApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roleRequired="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/dashboard"
          element={
            <ProtectedRoute roleRequired="restaurant">
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/menu/:restaurantId" element={<PublicMenu />} />
        <Route
          path="/menu/:restaurantId/order-success"
          element={<OrderSuccess />}
        />{" "}
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
