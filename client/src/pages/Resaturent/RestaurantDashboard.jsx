import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Features/auth/AuthSlice";
import {
  getRestaurantProfile,
  logoutRestaurant,
} from "../../API/restaurantApi";

import { getRestaurantNotifications } from "../../API/notificationApi";
import { getRestaurantOrders } from "../../API/orderApi";

import { setNotifications } from "../../Features/NotificationSlice";
import { setOrders } from "../../Features/OrderSlice";

import RestaurantSidebar from "./RestaurantSidebar";
import ProfileDetails from "./ProfileDetails";
import OverviewManager from "./OverviewManager";
import MenuManager from "./MenuManager";
import SettingsManager from "./SettingsManager";
import QRManager from "./QRManager";
import OrderManager from "./OrderManager";
import NotificationManager from "../../components/Restaurent/NotificationManager";
import WaiterCallAlert from "../../components/Restaurent/WaiterCallAlert";

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
    const fetchInitialBadgeData = async () => {
      try {
        const [notifRes, orderRes] = await Promise.all([
          getRestaurantNotifications(),
          getRestaurantOrders(),
        ]);

        if (notifRes.data && notifRes.data.success) {
          dispatch(setNotifications(notifRes.data.data));
        }
        if (orderRes.data && orderRes.data.success) {
          dispatch(setOrders(orderRes.data.data));
        }
      } catch (error) {
        console.log("Background fetch silently failed:", error);
      }
    };

    if (user) {
      fetchInitialBadgeData();
      const interval = setInterval(fetchInitialBadgeData, 30000);
      return () => clearInterval(interval);
    }
  }, [dispatch, user]);

  // SYNC RESTAURANT DETAILS
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
    // Responsive flex layout
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* SIDEBAR COMPONENT */}
      {/* Note: Agar mobile me sidebar hide karna ho future me, toh hum isko mobile hamburger menu se toggle karwa sakte hain */}
      <RestaurantSidebar
        restaurantName={restaurant?.restaurantName}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 sm:p-6 lg:p-10 relative">
        {activeTab === "overview" && (
          <OverviewManager setActiveTab={setActiveTab} />
        )}
        {activeTab === "orders" && <OrderManager />}
        {activeTab === "menu" && <MenuManager />}
        {activeTab === "qr" && <QRManager restaurant={restaurant} />}

        {activeTab === "profile" && (
          <ProfileDetails restaurant={restaurant} setActiveTab={setActiveTab} />
        )}

        {activeTab === "settings" && <SettingsManager />}

        {activeTab === "notifications" && <NotificationManager />}

        <WaiterCallAlert />
      </main>
    </div>
  );
};

export default RestaurantDashboard;
