import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import OrderDetails from "../components/OrderDetails"; // ✅ import your new component
import { toast } from "react-toastify";

const Notification = () => {
  const backendUri =
    import.meta.env.VITE_BACKEND_URI;
  const { customer, orderRecieveSuccess } = useContext(CartContext);
  const text = "Notifications";
  const [letters, setLetters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const onUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${backendUri}/api/order/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Invalid JSON:", text);
        return;
      }

      if (data.success) {
        toast.success("Order updated successfully!");
        await orderRecieveSuccess(); // ✅ Refresh list immediately
      } else {
        toast.error("Order update failed!");
      }
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const res = await fetch(`${backendUri}/api/order/orders/${orderId}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Order deleted successfully!");
        await orderRecieveSuccess(); // 🔁 Correct way to refresh customer list
      } else {
        toast.error("Failed to delete order!");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Error while deleting order!");
    }
  };

  useEffect(() => {
    const splitLetters = text.split("").map((char, index) => ({
      char,
      delay: `${index * 0.1}s`,
    }));
    setLetters(splitLetters);
  }, []);

  return (
    <div className="bg-gradient-to-br from-green-100 via-white to-orange-100 min-h-screen pb-10">
      {/* Animated Title */}
      <h2 className="text-center text-3xl mt-4 sm:mt-6 text-green-700 hover:text-orange-500 hover:underline cursor-pointer font-semibold">
        {letters.map((letter, index) => (
          <span
            key={index}
            className="letter inline-block" // Make span inline-block for animation to work correctly in all layouts
            style={{ animationDelay: letter.delay }}
          >
            {letter.char}
          </span>
        ))}
      </h2>

      {/* Notification Cards */}
      <div className="notification mt-6 sm:mt-8 px-2 sm:px-6">
        {customer && customer.length > 0 ? (
          <ul className="space-y-4 sm:space-y-6">
            {[...customer].map((order, index) => (
              <li
                key={index}
                className="border-2 border-green-600 bg-green-50 shadow-md rounded-2xl p-4 sm:p-6 transition-all duration-300 ease-in-out hover:bg-orange-50 hover:shadow-2xl hover:scale-[1.01] cursor-pointer flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4"
              >
                <p className="text-lg sm:text-xl text-green-900 font-medium text-center sm:text-left">
                  🧾 Order from Table:{" "}
                  <strong className="text-orange-700">
                    {order.tableNumber}
                  </strong>
                </p>

                <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-end items-center">
                  {/* Order Details Button */}
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowModal(true);
                    }}
                    className="bg-orange-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl transition duration-300 text-sm sm:text-base"
                  >
                    Details
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition duration-300 text-sm sm:text-base"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center mt-10 flex flex-col items-center justify-center gap-4 text-red-600">
            <img
              src="/NoNotification.png"
              alt="No Orders"
              className="w-64 h-64 sm:w-80 sm:h-80 object-contain animate-pulse opacity-80"
            />
            <p className="text-lg sm:text-xl font-semibold">
              🚫 Emergency status: The notification page is officially on vacation.
            </p>
          </div>
        )}
      </div>

      {/* Show OrderDetails Modal */}
      {showModal && (
        <OrderDetails
          order={selectedOrder}
          onClose={() => setShowModal(false)}
          onUpdateStatus={onUpdateStatus}
        />
      )}

      {/* Global Styles for Letter Animation (Consider moving to a CSS file) */}
      <style jsx global>
        {`
          .letter {
            display: inline-block; /* Ensure each letter can be animated individually */
            opacity: 0;
            animation: fadeInUp 0.8s ease-out forwards;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Notification;