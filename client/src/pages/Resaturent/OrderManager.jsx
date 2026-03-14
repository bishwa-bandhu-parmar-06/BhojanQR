import React, { useState, useEffect } from "react";
import { getRestaurantOrders, updateOrderStatus } from "../../API/orderApi";
import { toast } from "react-hot-toast";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  ChefHat,
  IndianRupee,
} from "lucide-react";

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      const res = await getRestaurantOrders();
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Optional: Set up an interval to check for new orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle Status Update
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatus(orderId, { status: newStatus });
      if (res.data.success) {
        toast.success(`Order marked as ${newStatus}`);
        // Update local state to reflect change instantly
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order,
          ),
        );
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Live Orders
          </h2>
          <p className="text-gray-500 mt-1 font-medium">
            Manage incoming orders from your tables.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-sm font-bold text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700">No Orders Yet</h3>
          <p className="text-gray-500 mt-2">
            When customers order via QR, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col"
            >
              {/* Order Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md mb-1 inline-block">
                    Table {order.tableNumber}
                  </span>
                  <h3 className="font-bold text-gray-800">
                    {order.customerName}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p
                    className={`text-xs font-bold mt-1 ${order.paymentStatus === "Paid" ? "text-green-600" : "text-amber-600"}`}
                  >
                    {order.paymentStatus === "Paid" ? "✅ Paid" : "⏳ Pending"}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 flex-1">
                <ul className="space-y-3">
                  {order.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-start text-sm"
                    >
                      <div className="flex gap-2">
                        <span className="font-bold text-gray-700">
                          {item.quantity}x
                        </span>
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-gray-500">
                        ₹{item.price * item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Order Footer & Actions */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-gray-500">Total</span>
                  <span className="text-lg font-black text-green-700 flex items-center">
                    <IndianRupee className="w-4 h-4" />
                    {order.totalPrice}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(order._id, "Pending")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${order.status === "Pending" ? "bg-amber-100 text-amber-700 border-2 border-amber-200" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                  >
                    <Clock className="w-4 h-4" /> Pending
                  </button>
                  <button
                    onClick={() => handleStatusChange(order._id, "Preparing")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${order.status === "Preparing" ? "bg-blue-100 text-blue-700 border-2 border-blue-200" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                  >
                    <ChefHat className="w-4 h-4" /> Preparing
                  </button>
                  <button
                    onClick={() => handleStatusChange(order._id, "Completed")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${order.status === "Completed" ? "bg-green-100 text-green-700 border-2 border-green-200" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                  >
                    <CheckCircle className="w-4 h-4" /> Completed
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManager;
