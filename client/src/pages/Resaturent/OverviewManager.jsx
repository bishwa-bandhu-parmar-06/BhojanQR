import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getDashboardStats } from "../../API/restaurantApi";
import { getRestaurantOrders } from "../../API/orderApi";
import { toast } from "react-hot-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  UtensilsCrossed,
  IndianRupee,
  TrendingUp,
  BellRing,
  Clock,
  Calendar,
  Award,
} from "lucide-react";

const OverviewManager = ({ setActiveTab }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const notifications = useSelector(
    (state) => state.notifications?.notifications || [],
  );
  const displayWaiterCalls = notifications.filter(
    (n) => n.type === "WAITER_CALL" && n.isRead === false,
  ).length;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await getDashboardStats();
        if (statsRes.data.success) {
          setDashboardData(statsRes.data.data);
        }

        const ordersRes = await getRestaurantOrders();
        if (ordersRes.data.success) {
          const paidOrders = ordersRes.data.data.filter(
            (o) => o.paymentStatus?.toLowerCase() === "paid",
          );
          const sortedTop5 = paidOrders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
          setRecentOrders(sortedTop5);
        }
      } catch (error) {
        toast.error("Failed to load dashboard analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const { menuStats, revenueStats, weeklyChartData, topSellingItems } =
    dashboardData;

  // Custom Tooltip for Premium Chart Look
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border border-gray-700">
          <p className="font-bold text-gray-300 mb-1">{label}</p>
          <p className="font-black text-orange-400 text-lg">
            ₹{payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Business Analytics
        </h2>
        <p className="text-gray-500 mt-1 font-medium">
          Track your revenue, sales, and top-performing items.
        </p>
      </div>

      {/* 🚀 REVENUE METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-5 rounded-2xl border border-green-200 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-20 text-green-600">
            <IndianRupee size={80} />
          </div>
          <p className="text-green-800 font-bold text-xs uppercase tracking-widest mb-1 relative z-10">
            Today's Revenue
          </p>
          <h4 className="text-3xl font-black text-green-900 relative z-10">
            ₹{revenueStats.todaysRevenue.toLocaleString()}
          </h4>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-1">
            <Calendar size={14} /> This Month
          </p>
          <h4 className="text-2xl font-black text-gray-800">
            ₹{revenueStats.thisMonthRevenue.toLocaleString()}
          </h4>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-1">
            <TrendingUp size={14} /> This Year
          </p>
          <h4 className="text-2xl font-black text-gray-800">
            ₹{revenueStats.thisYearRevenue.toLocaleString()}
          </h4>
        </div>

        <div
          onClick={() => setActiveTab("notifications")}
          className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${displayWaiterCalls > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}
        >
          <p
            className={`font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-1 ${displayWaiterCalls > 0 ? "text-red-600" : "text-gray-500"}`}
          >
            <BellRing
              size={14}
              className={displayWaiterCalls > 0 ? "animate-pulse" : ""}
            />{" "}
            Waiter Calls
          </p>
          <h4
            className={`text-2xl font-black ${displayWaiterCalls > 0 ? "text-red-600" : "text-gray-800"}`}
          >
            {displayWaiterCalls} Active
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 📈 REVENUE CHART AREA (Takes 2 columns on large screens) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
            <TrendingUp className="text-orange-500" size={20} /> Last 7 Days
            Revenue
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 600 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: "#f97316",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f97316"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🏆 TOP SELLING ITEMS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
            <Award className="text-orange-500" size={20} /> Top Selling Items
          </h3>

          {topSellingItems.length > 0 ? (
            <div className="space-y-5">
              {topSellingItems.map((item, index) => {
                const maxQty = topSellingItems[0].totalQuantity; // For progress bar math
                const percent = Math.round((item.totalQuantity / maxQty) * 100);

                return (
                  <div key={index} className="relative">
                    <div className="flex justify-between items-end mb-1">
                      <p className="font-bold text-sm text-gray-800 truncate pr-2">
                        {item._id}
                      </p>
                      <p className="font-black text-xs text-orange-600">
                        {item.totalQuantity} Sold
                      </p>
                    </div>
                    {/* Progress Bar background */}
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      {/* Progress Fill */}
                      <div
                        className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm font-medium text-center py-10">
              Not enough data to show top items.
            </p>
          )}
        </div>
      </div>

      {/* 🚀 RECENT ORDERS TABLE (Kept from your previous design but cleaned up) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Clock className="text-orange-500" size={20} />
            <h3 className="font-bold text-gray-800 text-lg">
              Live & Recent Orders
            </h3>
          </div>
          <button
            onClick={() => setActiveTab("orders")}
            className="text-orange-600 font-bold text-sm hover:text-orange-700"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          {recentOrders.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-400 text-xs uppercase tracking-widest border-b border-gray-100">
                  <th className="p-4 font-bold">Order ID</th>
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
                    <td className="p-4 font-bold text-gray-700 text-sm uppercase">
                      {order.razorpayPaymentId}
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      Table {order.tableNumber}
                    </td>
                    <td className="p-4 font-bold text-green-600">
                      ₹{order.totalPrice}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === "Completed" ? "bg-green-100 text-green-700" : order.status === "Preparing" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-400">
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
