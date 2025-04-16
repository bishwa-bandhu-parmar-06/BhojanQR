

import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
// import emptyCartImage from "../assets/ShoppingCart.png";

const Cart = () => {
  const { orderRecieveSuccess } = useContext(CartContext);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } =
    useContext(CartContext);

  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");

  const handleProceed = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error("Razorpay SDK failed to load.");
      return;
    }

    try {
      const orderItems = cart.map((item) => ({
        menuItem: item._id,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
      }));

      const totalPrice = getTotalPrice();

      const response = await fetch(
        `${VITE_BACKEND_URI}/api/order/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName,
            tableNumber,
            items: orderItems,
            totalPrice,
          }),
        }
      );

      const data = await response.json();

      const { razorpayOrderId, amount, currency, orderDBId } = data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_YourPublicKey",
        amount,
        currency,
        name: "BhojanQR Order",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async function (response) {
          const verifyRes = await fetch(
            `${VITE_BACKEND_URI}/api/order/verify-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDBId,
              }),
            }
          );

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            toast.success(`Payment successful ✅`);
            orderRecieveSuccess();

            navigate("/order-success", {
              state: {
                customerName,
                tableNumber,
                cart,
                total: totalPrice,
                paymentId: response.razorpay_payment_id,
              },
            });

            clearCart();
            setCustomerName("");
            setTableNumber("");
          } else {
            toast.error("Payment verification failed ❌");
          }
        },
        prefill: {
          name: customerName,
        },
        theme: {
          color: "#f97316",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    toast.error("Item removed from cart 🗑️");
  };

  const isFormValid = tableNumber.trim() !== "" && customerName.trim() !== "";

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-6 text-center">
        <img
          src="/ShoppingCart.png"
          alt="Empty Cart"
          className="w-48 h-48 object-contain mb-8"
        />
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Your cart is empty
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <button
          onClick={() => navigate("/menu")}
          className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Your Cart</h2>

      <div className="mb-8 space-y-4">
        {cart.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-lg shadow-sm overflow-hidden flex items-center justify-between"
          >
            <div className="flex items-center p-4">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md mr-4"
              />
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  {item.name}
                </h3>
                <p className="text-orange-500 font-semibold">₹{item.price}</p>
              </div>
            </div>

            <div className="flex items-center pr-4">
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden mr-3">
                <button
                  onClick={() =>
                    updateQuantity(item._id, Math.max(1, item.quantity - 1))
                  }
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100 focus:outline-none"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item._id, parseInt(e.target.value))
                  }
                  min="1"
                  className="w-12 text-center border-0 focus:ring-0"
                />
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="px-2 py-1 text-gray-600 hover:bg-gray-100 focus:outline-none"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => handleRemove(item._id)}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-right mb-8">
        <p className="text-xl font-bold text-green-700">
          Total: ₹{getTotalPrice()}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-green-800">
          Customer Details
        </h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="tableNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Table Number
            </label>
            <input
              type="text"
              id="tableNumber"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Enter table number"
            />
          </div>

          <div>
            <label
              htmlFor="customerName"
              className="block text-sm font-medium text-gray-700"
            >
              Customer Name
            </label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="Enter your name"
            />
          </div>
        </div>

        <div className="mt-6 mb-4 text-right">
          <p className="text-lg font-semibold text-green-700">
            Total Payable: ₹{getTotalPrice()}
          </p>
        </div>

        <button
          onClick={handleProceed}
          disabled={!isFormValid}
          className={`w-full py-3 font-bold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-75 ${
            isFormValid
              ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Proceed to Pay ₹{getTotalPrice()}
        </button>
      </div>
    </div>
  );
};

export default Cart;