import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../Features/Cart/CartSlice";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CreditCard,
  User,
  Hash,
  IndianRupee,
  AlertCircle,
  Package,
  Clock,
  Shield,
  Truck,
} from "lucide-react";

import { createOrder, verifyPayment } from "../API/orderApi";

import { requestForToken } from "../config/firebase";
const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const urlTableNumber = searchParams.get("table") || "";

  const cart = useSelector((state) => state.cart?.items || []);
  const totalAmount = useSelector((state) => state.cart?.totalAmount || 0);

  const [tableNumber, setTableNumber] = useState(urlTableNumber);
  const [customerName, setCustomerName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBackToMenu = () => {
    if (restaurantId) {
      const query = tableNumber ? `?table=${tableNumber}` : "";
      navigate(`/menu/${restaurantId}${query}`);
    } else {
      navigate("/");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProceed = async () => {
    if (!isFormValid) return;

    setIsProcessing(true);
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error("Razorpay SDK failed to load.");
      setIsProcessing(false);
      return;
    }

    try {

      let fcmToken = null;
      try {
        fcmToken = await requestForToken();
      } catch (tokenErr) {
        console.warn("User denied notifications or FCM failed:", tokenErr);
      }
      const orderItems = cart.map((item) => ({
        menuItem: item._id,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
      }));

      const { data } = await createOrder({
        restaurantId: restaurantId,
        customerName,
        tableNumber,
        items: orderItems,
        totalPrice: totalAmount,
        customerFcmToken: fcmToken,
      });

      if (!data.success) {
        toast.error(data.message || "Failed to create order");
        setIsProcessing(false);
        return;
      }

      const { razorpayOrderId, amount, currency, orderDBId } = data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_YourPublicKey",
        amount,
        currency,
        name: "BhojanQR",
        description: `Order for Table ${tableNumber}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Replaced the native fetch call with the verifyPayment API function
            const { data: verifyData } = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDBId,
            });

            if (verifyData.success) {
              toast.success(`Payment successful`);

              const restName =
                cart[0]?.restaurant?.restaurantName || "BhojanQR Partner";

              navigate(`/menu/${restaurantId}/order-success`, {
                state: {
                  customerName,
                  tableNumber,
                  cart,
                  total: totalAmount,
                  paymentId: response.razorpay_payment_id,
                  restaurantName: restName,
                  date: new Date().toISOString(),
                },
              });

              dispatch(clearCart());
            } else {
              toast.error("Payment verification failed");
              dispatch(clearCart());
            }
          } catch (error) {
            toast.error("Error verifying payment");
            dispatch(clearCart());
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: { name: customerName },
        theme: { color: "#f97316" },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        toast.error("Payment failed. Please try again.");
        dispatch(clearCart());
        setIsProcessing(false);
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleRemove = (id, name) => {
    dispatch(removeFromCart(id));
    toast.success(`${name} removed from cart`, { icon: "🗑️" });
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  const isFormValid = tableNumber.trim() !== "" && customerName.trim() !== "";

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackToMenu}
            className="mb-8 flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> <span>Back to Menu</span>
          </button>
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-orange-200 rounded-full blur-3xl opacity-30"></div>
              <img
                src="/ShoppingCart.png"
                alt="Empty Cart"
                className="w-48 h-48 mx-auto object-contain relative z-10"
              />
            </div>
            <h2 className="text-3xl font-bold text-green-700 mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Explore
              our delicious menu and find your favorite dishes!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleBackToMenu}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-medium"
              >
                Browse Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <button
              onClick={handleBackToMenu}
              className="mb-4 flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> <span>Continue Shopping</span>
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-green-700">
              Your <span className="text-orange-500">Cart</span>
            </h1>
            <p className="text-gray-600 mt-2">
              {cart.length} items in your cart
            </p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 min-w-[200px]">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-green-700 flex items-center gap-1">
              <IndianRupee className="w-5 h-5" />
              {totalAmount}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-32 h-32 relative overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.category || "Food Item"}
                        </p>
                        <p className="text-xl font-bold text-orange-500 mt-2">
                          ₹{item.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity - 1)
                            }
                            className="p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            readOnly
                            className="w-12 text-center border-0 focus:ring-0 text-lg font-semibold bg-transparent"
                          />
                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity + 1)
                            }
                            className="p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(item._id, item.name)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-green-100 to-orange-100 rounded-xl">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800">Checkout</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      Table Number
                    </div>
                  </label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                    placeholder="e.g., 5, 12, A3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      Customer Name
                    </div>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-orange-50 rounded-xl p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{totalAmount}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-700">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              {!isFormValid && (
                <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p className="text-xs">
                    Please enter both table number and your name to proceed
                  </p>
                </div>
              )}

              <button
                onClick={handleProceed}
                disabled={!isFormValid || isProcessing}
                className={`w-full py-4 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${isFormValid && !isProcessing ? "bg-gradient-to-r from-orange-500 to-green-500 text-white hover:shadow-xl transform hover:scale-[1.02]" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Pay ₹{totalAmount}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
