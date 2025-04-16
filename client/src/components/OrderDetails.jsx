


import React, { useState } from "react";
import toast from "react-hot-toast";

const OrderDetails = ({ order, onClose, onUpdateStatus }) => {
  if (!order) return null;

  const [updatedStatus, setUpdatedStatus] = useState(order.status);

  const handleStatusChange = () => {
    if (updatedStatus !== order.status) {
      onUpdateStatus(order._id, updatedStatus);
      toast.success("Order status updated successfully!");
    } else {
      toast("⚠️ Status is already set to " + updatedStatus);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md h-auto max-h-[90vh] shadow-2xl overflow-auto">
        {/* X button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-500 hover:text-red-600 text-3xl font-bold"
        >
          &times;
        </button>

        <h3 className="text-xl font-bold text-green-700 mb-4">Order Details</h3>

        <p className="text-gray-700 mb-2 text-sm sm:text-base">
          <strong>Table Number:</strong> {order.tableNumber}
        </p>
        <p className="text-gray-700 mb-2 text-sm sm:text-base">
          <strong>Customer Name:</strong> {order.customerName}
        </p>

        {/* Order Status Dropdown */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1 text-sm sm:text-base">
            Order Status:
          </label>
          <select
            value={updatedStatus}
            onChange={(e) => setUpdatedStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full sm:w-1/2 text-gray-800 text-sm sm:text-base"
          >
            <option value="Pending">Pending</option>
            <option value="Making">Making</option>
            <option value="Ready">Ready</option>
            <option value="Delivered">Delivered</option>
          </select>
          <button
            onClick={handleStatusChange}
            className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm sm:text-base"
          >
            Update Status
          </button>
        </div>

        <p className="text-gray-700 mb-2 text-sm sm:text-base">
          <strong>Total Price:</strong> ₹{order.totalPrice}
        </p>

        <div className="mt-4">
          <strong className="text-green-700 text-sm sm:text-base">Ordered Items:</strong>
          <ul className="list-disc list-inside text-gray-800 mt-2 text-sm sm:text-base">
            {Array.isArray(order.items) ? (
              order.items.map((item, idx) => (
                <li key={idx}>
                  {item.name} × {item.quantity} — ₹{item.price}
                </li>
              ))
            ) : (
              <li>{order.items?.name}</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;