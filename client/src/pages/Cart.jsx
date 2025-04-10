import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import emptyCartImage from "../assets/ShoppingCart.png"; // Make sure to add an empty cart image

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
  // console.log("Cart items:", cart);

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
      // console.log("totalPrice ", totalPrice)
      // Create order from backend
      const response = await fetch(
        "http://localhost:3000/api/order/create-order",
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
            "http://localhost:3000/api/order/verify-payment",
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <img
          src={emptyCartImage}
          alt="Empty Cart"
          className="w-full max-w-[500px] mb-8"
        />
        <h2 className="text-3xl font-bold text-gray-700 mb-4">
          Your cart is empty
        </h2>
        <p className="text-lg text-gray-500 mb-6">
          Looks like you haven't added anything to your cart yet.
        </p>
        <button
          onClick={() => navigate("/menu")}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-300"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Your Cart</h2>

      <div className="space-y-4 mb-8">
        {cart.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  {item.name}
                </h3>
                <p className="text-orange-500 font-semibold">₹{item.price}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item._id, parseInt(e.target.value))
                }
                min="1"
                className="w-16 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <button
                onClick={() => handleRemove(item._id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xl font-bold text-green-700 text-right mb-8">
        Total: ₹{getTotalPrice()}
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-green-800">
          Customer Details
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Table Number
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Enter table number"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Enter your name"
            />
          </div>
        </div>

        <div className="mt-6 mb-6 text-lg font-semibold text-right text-green-700">
          Total Payable: ₹{getTotalPrice()}
        </div>

        <button
          onClick={handleProceed}
          disabled={!isFormValid}
          className={`w-full py-3 font-bold rounded-lg transition-colors ${
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
