import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar"; // Navbar component import
import Home from "./pages/Home"; // Home page component import
import Menu from "./pages/Menu"; // Menu page component import
// Contact page component import
import Cart from "./pages/Cart"; // Cart page component import
import AdminLogin from "./pages/Admin"; // Admin login/signup page component import
import AdminDashboard from "./pages/AdminDashBoard";
import EditMenuForm from "./pages/EditMenuForm";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import OrderSuccess from "./pages/OrderSuccess";
import Notification from "./pages/Notification";
import TrackOrder from "./pages/TrackOrder";
const App = () => {
  return (
    <Router>
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/edit/:id" element={<EditMenuForm />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/track-order" element={<TrackOrder />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
