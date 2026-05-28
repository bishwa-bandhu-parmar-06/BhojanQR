import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRestaurantOrders, updateOrderStatus } from "../../API/orderApi";
import { toast } from "react-hot-toast";
import { setOrders, updateOrderStatusAction } from "../../Features/OrderSlice";
import OrderList from "../../components/Restaurent/OrderList";

const OrderManager = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders?.orders || []);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchOrders = async () => {
    try {
      const res = await getRestaurantOrders();
      if (res.data.success) {
        dispatch(setOrders(res.data.data));
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      dispatch(updateOrderStatusAction({ id: orderId, status: newStatus }));
      const res = await updateOrderStatus(orderId, { status: newStatus });
      if (res.data.success) {
        toast.success(`Order marked as ${newStatus}`);
      }
    } catch (error) {
      fetchOrders();
      toast.error("Failed to update status");
    }
  };

  // High Performance Client Side Status Segmentation and Count Telemetry
  const segmentedOrders = useMemo(() => {
    const all = orders;
    const pending = orders.filter((o) => o.status === "Pending");
    const preparing = orders.filter((o) => o.status === "Preparing");
    const completed = orders.filter((o) => o.status === "Completed");
    const cancelled = orders.filter((o) => o.status === "Cancelled");

    return { all, pending, preparing, completed, cancelled };
  }, [orders]);

  const tabsConfig = [
    {
      id: "all",
      label: "All Orders",
      count: segmentedOrders.all.length,
      msg: "No orders found in history.",
    },
    {
      id: "pending",
      label: "Pending",
      count: segmentedOrders.pending.length,
      msg: "No pending orders from tables right now.",
    },
    {
      id: "preparing",
      label: "Preparing",
      count: segmentedOrders.preparing.length,
      msg: "Kitchen queue is clear. No items are being cooked.",
    },
    {
      id: "completed",
      label: "Completed",
      count: segmentedOrders.completed.length,
      msg: "No completed orders tracked in this shift.",
    },
    {
      id: "cancelled",
      label: "Cancelled",
      count: segmentedOrders.cancelled.length,
      msg: "Clean records. No orders were cancelled.",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentTabDetails = tabsConfig.find((t) => t.id === activeTab);

  return (
    <div className="max-w-7xl mx-auto pb-10 font-sans px-4">
      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Live Order Hub
          </h2>
          <p className="text-gray-500 mt-1 font-medium">
            Monitor table actions, track payments and kitchen progress.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-5 py-2.5 rounded-xl transition-all self-start sm:self-auto"
        >
          Refresh Data
        </button>
      </div>

      {/* Modern High Contrast Tab Control Layout bar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-200 pb-3 mb-8">
        {tabsConfig.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-md font-black ${
                  isActive
                    ? "bg-white text-orange-600"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Render the core array associated to the selected tab identifier view */}
      <OrderList
        orders={segmentedOrders[activeTab]}
        handleStatusChange={handleStatusChange}
        emptyMessage={currentTabDetails.msg}
      />
    </div>
  );
};

export default OrderManager;
