import React, { useRef, useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { getOrderByToken } from "../API/orderApi";
import {
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  MapPin,
  User,
  Search,
  Coffee,
  Timer,
  Utensils,
  ChefHat,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TrackOrder = () => {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!token.trim()) {
      toast.error("Please enter a valid Order Token.", { id: "track-search" });
      return;
    }

    const toastId = "order-tracking";
    toast.loading("Fetching live status...", { id: toastId });

    setIsLoading(true);
    try {
      const res = await getOrderByToken(token);
      const orderData = res.data?.data || res.data;

      setOrder(orderData);

      toast.success("Status updated!", { id: toastId });
    } catch (err) {
      console.error("Tracking Error:", err);
      const errorMsg =
        err.response?.data?.message || "Order not found. Check your token.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Completed":
        return <CheckCircle className="w-6 h-6" />;
      case "Preparing":
        return <ChefHat className="w-6 h-6" />;
      case "Processing":
        return <Timer className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Completed: "bg-emerald-500",
      Preparing: "bg-orange-500",
      Processing: "bg-amber-500",
      Pending: "bg-slate-400",
    };
    return colors[status] || "bg-slate-400";
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans">
      {/* Light Gradient Background - Orange to Green */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-white to-green-50 -z-10"></div>
      
      {/* Subtle Pattern Overlay */}
      <div className="fixed inset-0 opacity-[0.15] -z-5" 
           style={{
             backgroundImage: `radial-gradient(circle at 1px 1px, #9ca3af 1px, transparent 0)`,
             backgroundSize: '40px 40px'
           }}>
      </div>

      {/* Floating Orbs - Very Subtle */}
      <div className="fixed top-20 left-10 w-64 h-64 rounded-full bg-orange-200/20 blur-3xl -z-5"></div>
      <div className="fixed bottom-20 right-10 w-80 h-80 rounded-full bg-green-200/20 blur-3xl -z-5"></div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="group mb-8 flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-all font-medium text-sm"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          BACK
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-green-400 rounded-2xl blur-md opacity-40"></div>
              <div className="relative bg-white p-3 rounded-2xl shadow-sm">
                <Package className="text-orange-500" size={28} />
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
            Track Your Order
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">
            Enter your payment ID to see real-time updates
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-4 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={18} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g., ORD-123456789"
                className="w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all text-slate-700 placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-orange-200/50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <span>Track Order</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Results */}
        {order ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Status Timeline */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Timer size={20} className="text-orange-500" />
                Order Status
              </h2>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Current Status:</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(order.status)} animate-pulse`}></span>
                  <span className="font-semibold text-slate-800">{order.status}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div className="text-xs font-semibold text-slate-600">
                    {order.status === "Completed" ? "Delivered" : "In Progress"}
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    {order.status === "Completed" ? "100%" : "50%"}
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-slate-100">
                  <div
                    style={{ width: order.status === "Completed" ? "100%" : "50%" }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-orange-500 to-green-500 transition-all duration-500"
                  ></div>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                {order.status === "Completed" 
                  ? "✅ Your order has been delivered! Enjoy your meal!" 
                  : "🕐 Your order is being prepared. We'll notify you when it's ready."}
              </p>
            </div>

            {/* Order Details */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-green-100 flex items-center justify-center">
                      <Utensils size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Order Summary</h3>
                      <p className="text-xs text-slate-500">Table #{order.tableNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Order Total</p>
                    <p className="text-xl font-bold text-slate-800">₹{order.totalPrice}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="p-6 space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-slate-400 w-6">
                        {idx + 1}.
                      </span>
                      <div>
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-700">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-slate-50/80 p-6 border-t border-slate-100">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User size={16} className="text-orange-500" />
                    <span>{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-slate-600">Payment Confirmed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/menu')}
                className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl border border-slate-200 transition-all"
              >
                Order More
              </button>
              <button
                onClick={() => {
                  setOrder(null);
                  setToken("");
                  inputRef.current?.focus();
                }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md shadow-orange-200/50"
              >
                Track Another
              </button>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-100 to-green-100 flex items-center justify-center">
              <Coffee size={32} className="text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              No Order to Track
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Enter your payment token above to see your order status
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-slate-400">
              <Search size={14} />
              <span>Example: ORD-123456789</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TrackOrder;