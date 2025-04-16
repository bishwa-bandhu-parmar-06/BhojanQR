


import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MenuForm from "../components/MenuForm";
import MenuList from "../components/MenuList";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import Notification from "../components/Notification";

import { CartContext } from "../context/CartContext";

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  const { customer } = useContext(CartContext);
  const pendingOrders = customer.filter((order) => order.status === "Pending"); // ya status === "Pending"

  const navigate = useNavigate();
  const backendUri =
    import.meta.env.VITE_BACKEND_URI;

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axios.get(`${backendUri}/api/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAdmin(response.data.admin);
      } catch (error) {
        console.error("Error fetching admin profile:", error);
        navigate("/admin");
      }
    };

    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(`${backendUri}/api/menu`);
        setMenuItems(response.data.items || []);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setMenuItems([]);
      }
    };

    fetchAdminProfile();
    fetchMenuItems();
  }, [navigate, backendUri]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${backendUri}/api/admin/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.removeItem("adminToken");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleMenuAdd = (newItem) => {
    try {
      setMenuItems((prevItems) =>
        Array.isArray(prevItems) ? [...prevItems, newItem] : [newItem]
      );
      toast.success("✅ Item added successfully!");
    } catch (error) {
      toast.error("❌ Error adding item.");
      console.error("Error in handleMenuAdd:", error);
    }
    setIsAdding(false);
  };

  const handleClick = () => {
    navigate("/notification");
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-700 font-sans">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans py-8">
      <ToastContainer />
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-orange-400 py-6 px-6">
          <h1 className="text-3xl font-semibold text-white text-center">
            Admin Dashboard
          </h1>
        </div>

        <div className="bg-white p-6">
          {/* Admin Profile Info */}
          <div className="flex items-center space-x-4 mb-6 border-b pb-4">
            {admin.profilePhoto ? (
              <img
                src={`${backendUri}${admin.profilePhoto}`}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-orange-500 cursor-pointer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center border-2 border-orange-500">
                <span className="text-3xl text-gray-500">👤</span>
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-gray-800">
                Welcome, {admin.name}!
              </p>
              <p className="text-sm text-gray-600">Email: {admin.email}</p>
              <p className="text-sm text-gray-600">Mobile: {admin.mobile}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setIsAdding(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
            >
              ➕ Add Menu Item
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
            >
              🚪 Logout
            </button>
            <div className="relative inline-block">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 relative"
                onClick={handleClick}
              >
                Notifications
                {pendingOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {pendingOrders.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Menu Form */}
          {isAdding && (
            <div className="mb-6 p-4 bg-gray-100 rounded-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Add New Menu Item
              </h2>
              <MenuForm
              
                backendUri={backendUri}
                onCancel={() => setIsAdding(false)}
                onSuccess={handleMenuAdd}
              />
            </div>
          )}

          {/* Menu List */}
          {Array.isArray(menuItems) && (
            <div>
              
              <MenuList
                backendUri={backendUri}
                menuItems={menuItems}
                setMenuItems={setMenuItems}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;