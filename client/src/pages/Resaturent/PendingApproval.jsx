import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Store,
  Mail,
  Phone,
  LogOut,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  logoutRestaurant,
  checkRestaurantStatus,
} from "../../API/restaurantApi";
import { logout, updateUser } from "../../Features/auth/AuthSlice"; // 🌟 updateUser import kiya
import toast from "react-hot-toast";

const PendingApproval = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isChecking, setIsChecking] = useState(false);

  if (!user) {
    navigate("/restaurant/auth");
    return null;
  }

  useEffect(() => {
    if (user?.status === "approved") {
      navigate("/restaurant/dashboard");
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logoutRestaurant();
      dispatch(logout());
      navigate("/restaurant/auth");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      const res = await checkRestaurantStatus();
      const currentStatus = res.data.status;

      if (currentStatus === "approved") {
        toast.success("Congratulations! Your account is approved. 🎉");

        // 🌟 1. PEHLE REDUX UPDATE KARO (Purane action ka use karke)
        dispatch(updateUser({ status: "approved" }));

        // 🌟 2. PHIR REDIRECT KARO
        navigate("/restaurant/dashboard");
      } else if (currentStatus === "rejected") {
        toast.error("Your application has been rejected.");
        dispatch(updateUser({ status: "rejected" }));
        navigate("/restaurant/auth");
      } else {
        toast.success("Application is still under review.", { icon: "⏳" });
      }
    } catch (error) {
      console.error("Status check failed:", error);
      toast.error("Failed to check status. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4 font-sans">
      {/* 🌟 Container thoda aur wide kiya (max-w-5xl) taaki proper space mile */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 w-full max-w-5xl overflow-hidden relative">
        <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-yellow-400"></div>

        <div className="p-8 md:p-14 lg:p-16 text-center">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-orange-100 text-orange-500 rounded-full mb-8 relative">
            <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin opacity-50"></div>
            <Clock className="w-14 h-14" />
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
            Application Under Review
          </h1>

          <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-12">
            Hi <span className="font-bold text-gray-900">{user.ownerName}</span>
            , your registration for
            <span className="font-bold text-gray-900">
              {" "}
              {user.restaurantName}
            </span>{" "}
            has been received successfully. Our team is currently verifying your
            details.
          </p>

          {/* 🌟 Grid layout with proper Flexbox constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-12 max-w-4xl mx-auto">
            {/* Restaurant Name */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center gap-5 overflow-hidden">
              <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <Store className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Restaurant
                </p>
                <p className="font-bold text-gray-900 text-base md:text-lg truncate block w-full">
                  {user.restaurantName}
                </p>
              </div>
            </div>

            {/* Registered Email - FIXED 🌟 */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center gap-5 overflow-hidden">
              <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <Mail className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Registered Email
                </p>
                <p
                  className="font-bold text-gray-900 text-base md:text-lg truncate block w-full"
                  title={user.email}
                >
                  {user.email}
                </p>
              </div>
            </div>

            {/* Contact Number */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center gap-5 overflow-hidden">
              <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <Phone className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Contact Number
                </p>
                <p className="font-bold text-gray-900 text-base md:text-lg truncate block w-full">
                  {user.mobile || "Not provided"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center gap-5 overflow-hidden">
              <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <ShieldCheck className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Status
                </p>
                <p className="font-bold text-amber-600 text-base md:text-lg items-center gap-2 truncate block w-full">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></span>
                  Verification Pending
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="flex items-center justify-center gap-3 px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-orange-200 transition-all active:scale-95 w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" /> Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />{" "}
                  Check Status Again
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="px-10 py-4 bg-white hover:bg-gray-50 text-gray-800 font-bold text-lg border border-gray-200 rounded-2xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              <LogOut className="w-5 h-5 text-gray-500" /> Sign Out
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-12 font-medium">
            Need help? Contact support at{" "}
            <a
              href="mailto:support@bhojanqr.com"
              className="text-orange-500 hover:underline"
            >
              support@bhojanqr.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
