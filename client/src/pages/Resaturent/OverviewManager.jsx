import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getDashboardStats } from "../../API/restaurantApi";
import { getRestaurantOrders } from "../../API/orderApi"; // 🛠️ IMPORTED ORDER API
import { toast } from "react-hot-toast";
import {
  UtensilsCrossed,
  ShoppingBag,
  IndianRupee,
  AlertCircle,
  TrendingUp,
  BellRing,
  Clock,
  ChevronRight,
} from "lucide-react";

const OverviewManager = ({ setActiveTab }) => {
  // Stats from backend overview API
  const [stats, setStats] = useState({
    totalMenuItems: 0,
    activeMenuItems: 0,
    outOfStockItems: 0,
    totalRevenue: 0,
    todaysRevenue: 0,
  });

  // 🛠️ DIRECT API STATES FOR ORDERS
  const [recentOrders, setRecentOrders] = useState([]);
  const [totalLiveOrders, setTotalLiveOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Live Waiter Calls (Keeping this in Redux as requested)
  const notifications = useSelector(
    (state) => state.notifications?.notifications || [],
  );
  const displayWaiterCalls = notifications.filter(
    (n) => n.type === "WAITER_CALL" && n.isRead === false,
  ).length;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Top-Level Stats
        const statsRes = await getDashboardStats();
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }

        // 🛠️ FETCH ACTUAL LIVE ORDERS DIRECTLY FROM API
        const ordersRes = await getRestaurantOrders();
        if (ordersRes.data.success) {
          const allOrders = ordersRes.data.data;

          // Filter out only successful/paid orders
          const paidOrders = allOrders.filter(
            (o) => o.paymentStatus?.toLowerCase() === "paid",
          );

          setTotalLiveOrders(paidOrders.length);

          // Sort by latest (createdAt) and grab the top 5 for the table
          const sortedTop5 = paidOrders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

          setRecentOrders(sortedTop5);
        }
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-gray-500 mt-1 font-medium">
            Real-time insights and metrics for your restaurant.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Today's Revenue
          </p>
          <p className="text-2xl font-black text-green-600">
            ₹{stats.todaysRevenue?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Menu Stats */}
        <div
          onClick={() => setActiveTab("menu")}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 text-gray-300 group-hover:text-orange-500 transition-colors">
            <ChevronRight size={20} />
          </div>
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
            <UtensilsCrossed size={24} />
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
            Menu Items
          </p>
          <div className="flex items-end gap-2">
            <h4 className="text-3xl font-black text-gray-800">
              {stats.totalMenuItems || 0}
            </h4>
            <p className="text-sm text-red-500 font-bold mb-1 border-l-2 pl-2 border-gray-200">
              {stats.outOfStockItems || 0} Out of Stock
            </p>
          </div>
        </div>

        {/* Live Orders Stats */}
        <div
          onClick={() => setActiveTab("orders")}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 text-gray-300 group-hover:text-blue-500 transition-colors">
            <ChevronRight size={20} />
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <ShoppingBag size={24} />
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
            Total Orders
          </p>
          <h4 className="text-3xl font-black text-gray-800">
            {totalLiveOrders}
          </h4>
        </div>

        {/* Total Revenue Stats */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <IndianRupee size={24} />
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
              Total Revenue
            </p>
            <h4 className="text-3xl font-black text-gray-800">
              ₹{stats.totalRevenue?.toLocaleString() || 0}
            </h4>
          </div>
        </div>

        {/* Waiter Calls Stats */}
        <div
          onClick={() => setActiveTab("notifications")}
          className={`p-6 rounded-2xl shadow-sm border transition-all cursor-pointer group relative overflow-hidden ${
            displayWaiterCalls > 0
              ? "bg-red-50 border-red-200 hover:shadow-red-100"
              : "bg-white border-gray-100 hover:shadow-lg"
          }`}
        >
          <div
            className={`absolute top-4 right-4 transition-colors ${displayWaiterCalls > 0 ? "text-red-400" : "text-gray-300 group-hover:text-gray-500"}`}
          >
            <ChevronRight size={20} />
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${displayWaiterCalls > 0 ? "bg-red-500 text-white animate-pulse" : "bg-gray-50 text-gray-500"}`}
          >
            <BellRing size={24} />
          </div>
          <p
            className={`text-sm font-bold uppercase tracking-wider mb-1 ${displayWaiterCalls > 0 ? "text-red-700" : "text-gray-500"}`}
          >
            Pending Calls
          </p>
          <h4
            className={`text-3xl font-black ${displayWaiterCalls > 0 ? "text-red-600" : "text-gray-800"}`}
          >
            {displayWaiterCalls}
          </h4>
        </div>
      </div>

      {/* 🛠️ ACTUAL RECENT ORDERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="text-orange-500" size={20} />
            <h3 className="font-bold text-gray-800 text-lg">Recent Orders</h3>
          </div>
          <button
            onClick={() => setActiveTab("orders")}
            className="text-orange-600 font-bold text-sm hover:text-orange-700 hover:underline"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          {recentOrders.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                  <th className="p-4 font-bold">Token / ID</th>
                  <th className="p-4 font-bold">Table</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-bold text-gray-800 uppercase">
                      {order.razorpayPaymentId}
                    </td>
                    <td className="p-4 font-bold text-gray-600">
                      Table {order.tableNumber}
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      ₹{order.totalPrice} {/* 🛠️ Adjusted to totalPrice */}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === "Completed" // 🛠️ Adjusted to status
                            ? "bg-green-100 text-green-700"
                            : order.status === "Preparing"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500 font-medium">
              No recent orders found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewManager;
