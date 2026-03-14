import React, { useState, useEffect } from "react";
import { getDashboardStats } from "../../API/restaurantApi";
import { toast } from "react-hot-toast";
import {
  UtensilsCrossed,
  ShoppingBag,
  IndianRupee,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const OverviewManager = () => {
  const [stats, setStats] = useState({
    totalMenuItems: 0,
    activeMenuItems: 0,
    outOfStockItems: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats();
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Dashboard Overview
        </h2>
        <p className="text-gray-500 mt-1 font-medium">
          A quick glance at your restaurant's performance and menu status.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Menu Items Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
            <UtensilsCrossed size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Total Menu Items
            </p>
            <h4 className="text-3xl font-black text-gray-800">
              {stats.totalMenuItems}
            </h4>
          </div>
        </div>

        {/* Active Items Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Active / Available
            </p>
            <h4 className="text-3xl font-black text-gray-800">
              {stats.activeMenuItems}
            </h4>
          </div>
        </div>

        {/* Out of Stock Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
            <AlertCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Out of Stock
            </p>
            <h4 className="text-3xl font-black text-gray-800">
              {stats.outOfStockItems}
            </h4>
          </div>
        </div>

        {/* Orders Card (Prepared for Future) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
            <ShoppingBag size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Total Orders
            </p>
            <h4 className="text-3xl font-black text-gray-800">
              {stats.totalOrders}
            </h4>
          </div>
        </div>

        {/* Revenue Card (Prepared for Future) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <IndianRupee size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Total Revenue
            </p>
            <h4 className="text-3xl font-black text-gray-800">
              ₹{stats.totalRevenue.toLocaleString()}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewManager;
