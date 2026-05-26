import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { logout } from "../../Features/auth/AuthSlice";
import { getAdminProfile, logoutAdmin } from "../../API/adminApi";
import { Menu } from "lucide-react";

// Import Custom Components
import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminProfile from "../../components/Admin/AdminProfile";
import RestaurantManagement from "../../components/Admin/RestaurantManagement";
import AppVersionManager from "../../components/Admin/AppVersionManager";
const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Layout States
  const [activeView, setActiveView] = useState("restaurants");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch initial Admin Data globally for the dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileResponse = await getAdminProfile();
        const adminData =
          profileResponse.data.data || profileResponse.data.admin;
        setAdmin(adminData);
      } catch (error) {
        if (error.response?.status === 401) {
          dispatch(logout());
          navigate("/admin");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate, dispatch]);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/admin");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium tracking-tight">
            Initializing Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* 1. SIDEBAR */}
      <AdminSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        handleLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (Shows only on small screens) */}
        <header className="lg:hidden bg-white h-16 flex items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="font-black text-slate-800 text-lg">BhojanQR</h1>
          </div>
          <div className="w-8 h-8 bg-orange-100 text-orange-600 font-bold flex items-center justify-center rounded-full text-sm">
            {admin?.name?.charAt(0).toUpperCase()}
          </div>
        </header>

        {/* Dynamic Content View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header info */}
            <div className="mb-8 hidden lg:block">
              <h2 className="text-2xl font-black text-slate-800 capitalize">
                {activeView === "restaurants"
                  ? "Restaurant Management"
                  : "My Profile"}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Welcome back,{" "}
                <span className="font-bold text-slate-700">{admin?.name}</span>!
              </p>
            </div>

            {/* Render Component based on sidebar selection */}
            {activeView === "restaurants" && <RestaurantManagement />}
            {activeView === "profile" && (
              <AdminProfile admin={admin} setAdmin={setAdmin} />
            )}
            {activeView === "app-config" && <AppVersionManager />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
