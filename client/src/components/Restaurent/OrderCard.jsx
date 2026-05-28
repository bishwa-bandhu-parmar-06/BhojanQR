import React from "react";
import {
  Clock,
  ChefHat,
  CheckCircle,
  XCircle,
  ReceiptText,
  IndianRupee,
} from "lucide-react";

const OrderCard = ({ order, handleStatusChange }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col ${
        order.status === "Cancelled"
          ? "border-red-200 opacity-80"
          : "border-gray-200"
      }`}
    >
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md inline-block">
              Table {order.tableNumber}
            </span>
            <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-md">
              #{order.tokenNumber || order._id.slice(-5).toUpperCase()}
            </span>
          </div>
          <h3 className="font-bold text-gray-800">{order.customerName}</h3>
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
              ? "Paid"
              : order.paymentStatus === "Refunded"
                ? "Refunded"
                : "Pending"}
          </p>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <ul className="space-y-3 mb-4">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex justify-between items-start text-sm">
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

        <div className="mt-auto pt-3 border-t border-dashed border-gray-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            <ReceiptText size={12} /> Transaction Details
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-500">
            <span className="uppercase font-bold">Order Ref</span>
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 truncate max-w-[160px]">
              {order.razorpayOrderId || order._id}
            </span>
          </div>

          {order.razorpayPaymentId && (
            <div className="flex justify-between items-center text-[10px] text-gray-500">
              <span className="uppercase font-bold">Pay ID</span>
              <span className="font-mono bg-green-50 text-green-700 border border-green-100 px-1.5 py-0.5 rounded truncate max-w-[160px]">
                {order.razorpayPaymentId}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-gray-500">Total</span>
          <span className="text-lg font-black text-gray-800 flex items-center">
            <IndianRupee className="w-4 h-4" />
            {order.totalPrice}
          </span>
        </div>

        {order.status === "Cancelled" ? (
          <div className="bg-red-50 text-red-600 py-3 rounded-lg font-bold flex items-center justify-center gap-2 w-full text-sm">
            <XCircle className="w-5 h-5" /> Order Cancelled
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange(order._id, "Pending")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  order.status === "Pending"
                    ? "bg-amber-100 text-amber-700 border-2 border-amber-200"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Clock className="w-4 h-4" /> Pending
              </button>
              <button
                onClick={() => handleStatusChange(order._id, "Preparing")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  order.status === "Preparing"
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-200"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <ChefHat className="w-4 h-4" /> Preparing
              </button>
              <button
                onClick={() => handleStatusChange(order._id, "Completed")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  order.status === "Completed"
                    ? "bg-green-100 text-green-700 border-2 border-green-200"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <CheckCircle className="w-4 h-4" /> Completed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
