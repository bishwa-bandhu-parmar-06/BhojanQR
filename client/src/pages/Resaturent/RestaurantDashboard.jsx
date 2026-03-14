import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Features/auth/AuthSlice";
import {
  getRestaurantProfile,
  logoutRestaurant,
} from "../../API/restaurantApi";

//  IMPORT YOUR NEW COMPONENTS
import RestaurantSidebar from "./RestaurantSidebar";
import ProfileDetails from "./ProfileDetails";

// IMPORT MANAGERS
import OverviewManager from "./OverviewManager";
import MenuManager from "./MenuManager";
import SettingsManager from "./SettingsManager";
import QRManager from "./QRManager";
import OrderManager from "./OrderManager";

const RestaurantDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getRestaurantProfile();
        setRestaurant(res.data.data);
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          dispatch(logout());
          toast.error("Session expired. Please log in again.", {
            toastId: "session-expired",
          });
          navigate("/restaurant/auth");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, dispatch]);

  useEffect(() => {
    if (user && restaurant) {
      setRestaurant((prev) => ({
        ...prev,
        restaurantName: user.restaurantName || user.name || prev.restaurantName,
        ownerName: user.ownerName || prev.ownerName,
        mobile: user.mobile || prev.mobile,
      }));
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logoutRestaurant();
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500"></div>
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* EXTACTED SIDEBAR COMPONENT */}
      <RestaurantSidebar
        restaurantName={restaurant?.restaurantName}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 lg:p-10 relative">
        {activeTab === "overview" && <OverviewManager />}
        {activeTab === "orders" && <OrderManager />}
        {activeTab === "menu" && <MenuManager />}
        {activeTab === "qr" && <QRManager restaurant={restaurant} />}

        {/* EXTRACTED PROFILE UI */}
        {activeTab === "profile" && (
          <ProfileDetails restaurant={restaurant} setActiveTab={setActiveTab} />
        )}

        {activeTab === "settings" && <SettingsManager />}
      </main>
    </div>
  );
};

export default RestaurantDashboard;
