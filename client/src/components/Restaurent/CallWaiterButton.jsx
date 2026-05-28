import React, { useState, useEffect } from "react";
import {
  BellRing,
  CheckCircle2,
  Loader2,
  X,
  Droplet,
  FileText,
  Utensils,
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { requestWaiterService } from "../../API/ServiceRequestApi";

const CallWaiterButton = ({ restaurantId, tableNumber }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 🚀 Controls the Quick Options Modal

  const cooldownKey = `waiter_cooldown_${restaurantId}_${tableNumber}`;
  const COOLDOWN_TIME = 3 * 60 * 1000; // 3 Minutes

  // 📋 Premium Quick Options for the Customer
  const waiterOptions = [
    {
      id: "water",
      label: "Need Water Bottle 💧",
      icon: Droplet,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      id: "bill",
      label: "Bring the Bill 🧾",
      icon: FileText,
      color: "text-green-600 bg-green-50 border-green-100",
    },
    {
      id: "tissue",
      label: "Need Extra Tissues 🧻",
      icon: FileSpreadsheet,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      id: "spoons",
      label: "Need Spoons / Fork 🍴",
      icon: Utensils,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      id: "general",
      label: "General Assistance 🙋‍♂️",
      icon: HelpCircle,
      color: "text-orange-600 bg-orange-50 border-orange-100",
    },
  ];

  // Sync Cooldown from LocalStorage (Survives Hard Refresh)
  useEffect(() => {
    if (!restaurantId || !tableNumber) return;

    const savedTimestamp = localStorage.getItem(cooldownKey);
    if (savedTimestamp) {
      const elapsed = Date.now() - parseInt(savedTimestamp, 10);

      if (elapsed < COOLDOWN_TIME) {
        setIsCooldown(true);
        const remainingTime = COOLDOWN_TIME - elapsed;
        const timer = setTimeout(() => {
          setIsCooldown(false);
          localStorage.removeItem(cooldownKey);
        }, remainingTime);

        return () => clearTimeout(timer);
      } else {
        localStorage.removeItem(cooldownKey);
      }
    }
  }, [restaurantId, tableNumber, isCooldown]);

  // Triggered when any specific option is selected
  const executeCallWaiter = async (selectedMessage) => {
    if (!tableNumber) {
      toast.error("Table number not found. Please scan the QR code again.");
      return;
    }

    setIsCalling(true);
    setIsModalOpen(false); // Close modal immediately for smooth UX

    try {
      const res = await requestWaiterService({
        restaurantId: restaurantId,
        tableNumber: tableNumber,
        message: selectedMessage, // Sending dynamic quick option string
      });

      if (res.data && res.data.success) {
        toast.success("Waiter has been notified! 🏃‍♂️", { duration: 4000 });
        localStorage.setItem(cooldownKey, Date.now().toString());
        setIsCooldown(true);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to call waiter.";
      toast.error(errorMsg);

      if (
        error.response?.status === 429 ||
        errorMsg.includes("already informed")
      ) {
        localStorage.setItem(cooldownKey, Date.now().toString());
        setIsCooldown(true);
      }
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <>
      {/* 🛑 MAIN FLOATING INTERACTIVE BUTTON */}
      <button
        onClick={() => !isCooldown && setIsModalOpen(true)}
        disabled={isCalling || isCooldown}
        className={`fixed bottom-24 left-4 md:bottom-8 md:left-8 z-[70] flex items-center gap-2 px-5 py-3.5 rounded-full shadow-2xl font-bold text-white transition-all transform active:scale-95 ${
          isCooldown
            ? "bg-gray-400 cursor-not-allowed opacity-80"
            : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/40 hover:shadow-orange-500/60"
        }`}
      >
        {isCalling ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isCooldown ? (
          <CheckCircle2 className="w-5 h-5 text-white" />
        ) : (
          <BellRing className="w-5 h-5 animate-pulse" />
        )}

        <span className="hidden sm:inline">
          {isCalling
            ? "Calling..."
            : isCooldown
              ? "Waiter Informed"
              : "Call Waiter"}
        </span>
        <span className="sm:hidden">
          {isCalling ? "..." : isCooldown ? "Sent" : "Call"}
        </span>
      </button>

      {/* 🚀 MODERN BOTOM-SHEET QUICK OPTIONS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 border-t border-gray-100 flex flex-col max-h-[85vh]">
            {/* Top Drag Indicator Line */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 shrink-0"></div>

            {/* Header */}
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  How can we help you?
                </h3>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">
                  Select a quick option for Table #{tableNumber}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Quick Options List */}
            <div className="space-y-3 overflow-y-auto pr-1 pb-4 flex-1 custom-scrollbar">
              {waiterOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => executeCallWaiter(option.label)}
                    className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 p-4 rounded-2xl flex items-center gap-4 transition-all group text-left shadow-sm"
                  >
                    <div
                      className={`p-3 rounded-xl border transition-colors ${option.color}`}
                    >
                      <IconComponent size={22} />
                    </div>
                    <span className="font-extrabold text-gray-800 text-sm md:text-base group-hover:text-orange-500 transition-colors flex-1">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CallWaiterButton;
