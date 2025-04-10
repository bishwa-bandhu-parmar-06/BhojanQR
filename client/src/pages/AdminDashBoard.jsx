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
    import.meta.env.VITE_BACKEND_URI || "http://localhost:3000";

  // ✅ Fetch admin profile and menu items
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
        setMenuItems(response.data.menuItems || []);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setMenuItems([]);
      }
    };

    fetchAdminProfile();
    fetchMenuItems();
  }, [navigate, backendUri]);

  // ✅ Logout
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

  // ✅ Handle adding new menu item
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
      <div className="h-screen flex items-center justify-center text-xl text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-orange-100 to-green-50 p-6">
      <ToastContainer />
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-orange-500 mb-6">
          Admin Dashboard
        </h1>

        {/* Admin Profile Info */}
        <div className="flex items-center space-x-4 mb-6">
          {admin.profilePhoto ? (
            <img
              src={`${backendUri}${admin.profilePhoto}`}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-orange-500 cursor-pointer"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-orange-500">
              <span className="text-4xl text-gray-500">👤</span>
            </div>
          )}
          <div>
            <p className="text-lg font-semibold">Welcome, {admin.name}!</p>
            <p>Email: {admin.email}</p>
            <p>Mobile: {admin.mobile}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setIsAdding(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
          >
            ➕ Add Menu Item
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            🚪 Logout
          </button>
          {/* <button
            className="bg-green-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
            onClick={()=>navigate("/notification")}
          >
            Notification
          </button> */}

          <div className="relative inline-block">
            <button
              className="bg-green-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors relative"
              onClick={handleClick}
            >
              Notification
              {pendingOrders.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingOrders.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Menu Form */}
        {isAdding && (
          <MenuForm
            backendUri={backendUri}
            onCancel={() => setIsAdding(false)}
            onSuccess={handleMenuAdd}
          />
        )}

        {/* Menu List */}
        {Array.isArray(menuItems) && (
          <MenuList
            backendUri={backendUri}
            menuItems={menuItems}
            setMenuItems={setMenuItems}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
