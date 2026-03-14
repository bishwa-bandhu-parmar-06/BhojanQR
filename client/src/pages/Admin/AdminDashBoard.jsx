import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { useDispatch } from "react-redux";
import { logout, updateUser } from "../../Features/auth/AuthSlice";

import {
  getAdminProfile,
  logoutAdmin,
  updateAdminProfile,
  getPendingRestaurants,
  getApprovedRestaurants,
  getRejectedRestaurants,
  approveRestaurant,
  rejectRestaurant,
} from "../../API/adminApi";

import {
  LayoutDashboard,
  LogOut,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Edit2,
  Save,
  Store,
  RefreshCw,
  Search,
} from "lucide-react";

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [restaurants, setRestaurants] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [isListLoading, setIsListLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  // Profile Edit States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: "", mobile: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch Admin Profile
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileResponse = await getAdminProfile();
        const adminData =
          profileResponse.data.data || profileResponse.data.admin;
        setAdmin(adminData);
        setEditFormData({ name: adminData.name, mobile: adminData.mobile });
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

  // Fetch Restaurants based on Active Tab
  const fetchRestaurants = async () => {
    setIsListLoading(true);
    try {
      let res;
      if (activeTab === "pending") res = await getPendingRestaurants();
      else if (activeTab === "approved") res = await getApprovedRestaurants();
      else res = await getRejectedRestaurants();
      setRestaurants(res.data.data);
    } catch (error) {
      toast.error("Failed to load restaurant list");
    } finally {
      setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [activeTab]);

  const handleStatusUpdate = async (id, action) => {
    setActionId(id);
    try {
      if (action === "approve") {
        await approveRestaurant(id);
        toast.success("Restaurant Approved!");
      } else {
        await rejectRestaurant(id);
        toast.warn("Restaurant Rejected");
      }
      fetchRestaurants();
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setActionId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await updateAdminProfile(editFormData);
      if (response.data.success) {
        const updatedAdmin = response.data.admin || response.data.data;

        // Update Local State
        setAdmin(updatedAdmin);

        // 2. INSTANTLY UPDATE REDUX
        // This instantly tells the Navbar to re-render with the new name
        dispatch(
          updateUser({
            name: updatedAdmin.name,
            mobile: updatedAdmin.mobile,
          }),
        );

        toast.success("Profile updated successfully!");
        setShowEditModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Syncing Admin Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative pb-20">
      <div className="container mx-auto px-4 lg:px-8 mt-8">
        {/* Row 1: Profile & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Profile Details */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative">
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute top-4 right-4 text-slate-400 hover:text-orange-500 p-2"
            >
              <Edit2 size={18} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-3xl border-2 border-orange-500 mb-4">
                👤
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {admin?.name}
              </h2>
              <p className="text-sm text-slate-500 mb-4">{admin?.email}</p>
              <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
                <span>Mobile:</span>
                <span className="font-medium">{admin?.mobile}</span>
              </div>
            </div>
          </div>

          {/* Restaurant Management Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Store className="text-orange-500" /> Restaurant Requests
              </h3>

              {/* Tab Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {["pending", "approved", "rejected"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                      activeTab === tab
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto min-h-[300px]">
              {isListLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="animate-spin text-orange-500" />
                </div>
              ) : restaurants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Store size={48} className="mb-2 opacity-20" />
                  <p>No {activeTab} restaurants found.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-6 py-3">Restaurant</th>
                      <th className="px-6 py-3">Owner & Contact</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {restaurants.map((res) => (
                      <tr
                        key={res._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">
                            {res.restaurantName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            ID: {res._id.slice(-6)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-700">
                            {res.ownerName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {res.mobile}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {activeTab === "pending" ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() =>
                                  handleStatusUpdate(res._id, "approve")
                                }
                                disabled={actionId === res._id}
                                className="p-2 text-green-600 bg-green-50 hover:bg-green-600 hover:text-white rounded-lg transition-all"
                              >
                                {actionId === res._id ? (
                                  <RefreshCw
                                    className="animate-spin"
                                    size={16}
                                  />
                                ) : (
                                  <CheckCircle size={18} />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(res._id, "reject")
                                }
                                disabled={actionId === res._id}
                                className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                              >
                                {actionId === res._id ? (
                                  <RefreshCw
                                    className="animate-spin"
                                    size={16}
                                  />
                                ) : (
                                  <XCircle size={18} />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                                activeTab === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {res.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Edit Admin Profile
              </h2>
              <button onClick={() => setShowEditModal(false)}>
                <XCircle className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Name"
              />
              <input
                type="tel"
                value={editFormData.mobile}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, mobile: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Mobile"
              />
              <button
                disabled={isUpdating}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}{" "}
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
