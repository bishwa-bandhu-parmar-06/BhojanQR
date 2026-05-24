import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRestaurantOrders, updateOrderStatus } from "../../API/orderApi";
import { toast } from "react-hot-toast";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  ChefHat,
  IndianRupee,
  XCircle,
  ReceiptText, 
} from "lucide-react";

import { setOrders, updateOrderStatusAction } from "../../Features/OrderSlice";

// import CancelOrderModal from "../../components/Restaurent/CancelOrderModal";

const OrderManager = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders?.orders || []);
  const [loading, setLoading] = useState(true);

  // const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  // const [selectedOrderIdToCancel, setSelectedOrderIdToCancel] = useState(null);

  // Fetch Orders
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

  /* // Commented out Cancel functionality
  const initiateCancelOrder = (orderId) => {
    setSelectedOrderIdToCancel(orderId);
    setIsCancelModalOpen(true);
  };

  const executeCancelOrder = async (orderId, reason) => {
    try {
      dispatch(updateOrderStatusAction({ id: orderId, status: "Cancelled" }));

      const res = await updateOrderStatus(orderId, {
        status: "Cancelled",
        cancellationReason: reason,
      });

      if (res.data.success) {
        toast.success(
          "Order cancelled successfully. Refund initiated if paid.",
        );
        fetchOrders();
      }
    } catch (error) {
      fetchOrders();
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };
  */

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={executeCancelOrder}
        orderId={selectedOrderIdToCancel}
      /> */}

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
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col ${
                order.status === "Cancelled"
                  ? "border-red-200 opacity-80"
                  : "border-gray-200"
              }`}
            >
              {/* Order Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md inline-block">
                      Table {order.tableNumber}
                    </span>
                    {/* 🛠️ Token display near table number */}
                    <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-md">
                      #{order.tokenNumber || order._id.slice(-5).toUpperCase()}
                    </span>
                  </div>
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
                    className={`text-xs font-bold mt-1 ${
                      order.paymentStatus === "Paid"
                        ? "text-green-600"
                        : order.paymentStatus === "Refunded"
                          ? "text-blue-600"
                          : "text-amber-600"
                    }`}
                  >
                    {order.paymentStatus === "Paid"
                      ? "✅ Paid"
                      : order.paymentStatus === "Refunded"
                        ? "🔄 Refunded"
                        : "⏳ Pending"}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-4 flex-1 flex flex-col">
                <ul className="space-y-3 mb-4">
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
                      <span className="text-gray-500 font-medium">
                        ₹{item.price * item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* 🛠️ NEW: Payment & Identification Details Section */}
                <div className="mt-auto pt-3 border-t border-dashed border-gray-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    <ReceiptText size={12} /> Transaction Details
                  </div>

                  {/* Razorpay Order ID or Mongo ID */}
                  <div className="flex justify-between items-center text-[10px] text-gray-500">
                    <span className="uppercase font-bold">Order Ref</span>
                    <span
                      className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 truncate max-w-[160px]"
                      title={order.razorpayOrderId || order._id}
                    >
                      {order.razorpayOrderId || order._id}
                    </span>
                  </div>

                  {/* Razorpay Payment ID (Only shows if Paid/Exists) */}
                  {order.razorpayPaymentId && (
                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span className="uppercase font-bold">Pay ID</span>
                      <span
                        className="font-mono bg-green-50 text-green-700 border border-green-100 px-1.5 py-0.5 rounded truncate max-w-[160px]"
                        title={order.razorpayPaymentId}
                      >
                        {order.razorpayPaymentId}
                      </span>
                    </div>
                  )}
                </div>

                {/* Display Cancellation Reason if it exists */}
                {/* {order.status === "Cancelled" && order.cancellationReason && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg text-xs text-red-600 border border-red-100">
                    <strong>Reason:</strong> {order.cancellationReason}
                  </div>
                )} */}
              </div>

              {/* Order Footer & Actions */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-gray-500">Total</span>
                  <span className="text-lg font-black text-gray-800 flex items-center">
                    <IndianRupee className="w-4 h-4" />
                    {order.totalPrice}
                  </span>
                </div>

                {/* Conditional Action Buttons */}
                {order.status === "Cancelled" ? (
                  <div className="bg-red-50 text-red-600 py-3 rounded-lg font-bold flex items-center justify-center gap-2 w-full">
                    <XCircle className="w-5 h-5" /> Order Cancelled
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(order._id, "Pending")}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${order.status === "Pending" ? "bg-amber-100 text-amber-700 border-2 border-amber-200" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                      >
                        <Clock className="w-4 h-4" /> Pending
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(order._id, "Preparing")
                        }
                        className={`flex-1 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${order.status === "Preparing" ? "bg-blue-100 text-blue-700 border-2 border-blue-200" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                      >
                        <ChefHat className="w-4 h-4" /> Preparing
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(order._id, "Completed")
                        }
                        className={`flex-1 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${order.status === "Completed" ? "bg-green-100 text-green-700 border-2 border-green-200" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                      >
                        <CheckCircle className="w-4 h-4" /> Completed
                      </button>
                    </div>

                    {/* 🛠️ Cancel Button opens Custom Modal instead of window.prompt */}
                    {/* <button
                      onClick={() => initiateCancelOrder(order._id)}
                      className="w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all mt-1"
                    >
                      <XCircle className="w-4 h-4" /> Cancel Order
                    </button> */}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManager;
