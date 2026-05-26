import React, { useEffect, useState } from "react";
import {
  Store,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  TrendingUp,
  ShoppingBag,
  List as MenuList,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getPendingRestaurants,
  getApprovedRestaurants,
  getRejectedRestaurants,
  updateRestaurantStatus,
  getRestaurantDetailsAdmin,
} from "../../API/adminApi";

const RestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [isListLoading, setIsListLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

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

  // Universal Status Update Logic
  const handleStatusUpdate = async (e, id, newStatus) => {
    e.stopPropagation(); // Stop row click event
    setActionId(id);
    try {
      await updateRestaurantStatus(id, newStatus);
      toast.success(`Restaurant marked as ${newStatus}`);
      fetchRestaurants();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setActionId(null);
    }
  };

  // Open Detailed Modal
  const openDetailsModal = async (id) => {
    setIsModalOpen(true);
    setIsDetailsLoading(true);
    try {
      const res = await getRestaurantDetailsAdmin(id);
      setSelectedDetails(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch details");
      setIsModalOpen(false);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <Store className="text-orange-500" /> Restaurant Directory
        </h3>

        <div className="flex bg-slate-200/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
          {["pending", "approved", "rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        {isListLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="animate-spin text-orange-500" size={30} />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Store size={48} className="mb-3 opacity-20" />
            <p className="font-medium">No {activeTab} restaurants found.</p>
          </div>
        ) : (
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Owner & Contact</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4 text-right">Super Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {restaurants.map((res) => (
                <tr
                  key={res._id}
                  onClick={() => openDetailsModal(res._id)}
                  className="hover:bg-orange-50/40 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      {res.restaurantName}
                      <Eye
                        size={14}
                        className="text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div className="text-[11px] font-medium text-slate-400">
                      ID: {res._id.slice(-8)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-700">
                      {res.ownerName}
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      {res.mobile}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${
                        res.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : res.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {res.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Show Approve Button if not already approved */}
                      {res.status !== "approved" && (
                        <button
                          onClick={(e) =>
                            handleStatusUpdate(e, res._id, "approved")
                          }
                          disabled={actionId === res._id}
                          className="p-2 text-green-600 bg-green-50 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                          title="Approve"
                        >
                          {actionId === res._id ? (
                            <RefreshCw className="animate-spin" size={16} />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                        </button>
                      )}

                      {/* Show Reject Button if not already rejected */}
                      {res.status !== "rejected" && (
                        <button
                          onClick={(e) =>
                            handleStatusUpdate(e, res._id, "rejected")
                          }
                          disabled={actionId === res._id}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                          title="Reject"
                        >
                          {actionId === res._id ? (
                            <RefreshCw className="animate-spin" size={16} />
                          ) : (
                            <XCircle size={16} />
                          )}
                        </button>
                      )}

                      {/* Show Pending Button if not already pending */}
                      {res.status !== "pending" && (
                        <button
                          onClick={(e) =>
                            handleStatusUpdate(e, res._id, "pending")
                          }
                          disabled={actionId === res._id}
                          className="p-2 text-yellow-600 bg-yellow-50 hover:bg-yellow-500 hover:text-white rounded-lg transition-all"
                          title="Move to Pending"
                        >
                          {actionId === res._id ? (
                            <RefreshCw className="animate-spin" size={16} />
                          ) : (
                            <Clock size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ==============================================
          RESTAURANT DETAILS MODAL 
      ============================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-5 flex justify-between items-center">
              <h2 className="text-xl font-black text-white">
                Restaurant Dashboard
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8">
              {isDetailsLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-orange-500">
                  <RefreshCw className="animate-spin" size={32} />
                  <p className="text-sm font-bold text-slate-500">
                    Fetching live analytics...
                  </p>
                </div>
              ) : selectedDetails ? (
                <div className="space-y-8">
                  {/* Profile Section */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-200">
                      <Store size={30} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-800">
                        {selectedDetails.restaurant.restaurantName}
                      </h3>
                      <p className="text-sm font-medium text-slate-500">
                        Owner:{" "}
                        <span className="font-bold text-slate-700">
                          {selectedDetails.restaurant.ownerName}
                        </span>
                      </p>
                      <p className="text-sm font-medium text-slate-500">
                        Contact: {selectedDetails.restaurant.mobile} |{" "}
                        {selectedDetails.restaurant.email}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                      <MenuList className="text-blue-500 mb-2" size={20} />
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Total Items
                      </p>
                      <p className="text-2xl font-black text-slate-800">
                        {selectedDetails.stats.totalMenus}
                      </p>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl">
                      <TrendingUp className="text-orange-500 mb-2" size={20} />
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Today's Orders
                      </p>
                      <p className="text-2xl font-black text-slate-800">
                        {selectedDetails.stats.todaysOrders}
                      </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl">
                      <ShoppingBag className="text-purple-500 mb-2" size={20} />
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        All Time Orders
                      </p>
                      <p className="text-2xl font-black text-slate-800">
                        {selectedDetails.stats.totalOrders}
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-100 p-4 rounded-2xl">
                      <span className="text-green-500 font-black text-xl mb-2 block">
                        ₹
                      </span>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Total Revenue
                      </p>
                      <p className="text-xl font-black text-slate-800">
                        ₹{selectedDetails.stats.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-xs font-bold text-slate-400">
                      Joined:{" "}
                      {new Date(
                        selectedDetails.restaurant.createdAt,
                      ).toLocaleDateString()}
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg ${
                        selectedDetails.restaurant.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : selectedDetails.restaurant.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {selectedDetails.restaurant.status}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-center text-slate-500">No data found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantManagement;
