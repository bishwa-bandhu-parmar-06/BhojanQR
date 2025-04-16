import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const TrackOrder = () => {
  const backendUri =
    import.meta.env.VITE_BACKEND_URI;
  const inputRef = useRef(null);
  const [token, setToken] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setOrder(null);

    if (!token.trim()) {
      toast.error("Please enter a valid Order Token.");
      return;
    }

    try {
      const res = await axios.get(`${backendUri}/api/orderreceived/${token}`);
      setOrder(res.data);
      toast.success("✅ Order details found!");
    } catch (err) {
      console.error("Error fetching order:", err);
      toast.error(
        err.response?.data?.message ||
          "❌ Incorrect Order Token. Please try again."
      );
    }
  };

  return (
    <div className="max-w-md sm:max-w-xl mx-auto mt-10 sm:mt-20 p-4 sm:p-6 shadow-lg bg-white rounded-lg">
      {/* Toast container (Consider placing this at a higher level for global access) */}
      {/* <Toaster position="top-center" reverseOrder={false} /> */}

      <h1 className="text-xl sm:text-2xl font-bold text-center text-green-700 mb-4 sm:mb-6">
        Track Your Order
      </h1>

      <form
        onSubmit={handleSearch}
        className="flex flex-col items-center gap-3 sm:gap-4"
      >
        <input
          ref={inputRef}
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter Order Token (ID)"
          className="w-full border border-gray-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition text-sm sm:text-base"
        >
          Track Order
        </button>
      </form>

      {order && (
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl bg-white shadow-md border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-green-800 mb-3 sm:mb-4">
            🧾 Order Details
          </h2>

          <div className="space-y-1.5 sm:space-y-2 text-gray-700 text-sm sm:text-base">
            <p>
              <span className="font-medium text-gray-600">👤 Customer:</span>{" "}
              <span className="text-gray-900">
                <strong>{order.customerName}</strong>
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-600">🍽️ Table:</span>{" "}
              <span className="text-gray-900">
                #<strong>{order.tableNumber}</strong>
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-600">💰 Total:</span>{" "}
              <span className="text-green-600 font-semibold">
                ₹{order.totalPrice}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-600">📦 Status:</span>{" "}
              <span
                className={`font-semibold ${
                  order.status === "Completed"
                    ? "text-green-600"
                    : "text-yellow-500"
                }`}
              >
                {order.status}
              </span>
            </p>
          </div>

          <div className="mt-3 sm:mt-4">
            <h3 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">
              🧺 Items Ordered:
            </h3>
            <ul className="list-disc list-inside pl-3 text-gray-800 space-y-1 text-sm sm:text-base">
              {order.items.map((item, idx) => (
                <li key={idx}>
                  <span className="font-semibold">{item.name}</span> &times;{" "}
                  {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Toaster (Consider placing this at a higher level for global access) */}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default TrackOrder;