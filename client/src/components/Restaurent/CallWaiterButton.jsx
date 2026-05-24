import React, { useState } from "react";
import { BellRing, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { requestWaiterService } from "../../API/ServiceRequestApi";

const CallWaiterButton = ({ restaurantId, tableNumber }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);

  const handleCallWaiter = async () => {
    if (!tableNumber) {
      toast.error(
        "Table number not found. Please scan the QR code from your table.",
      );
      return;
    }

    setIsCalling(true);
    try {
      const res = await requestWaiterService({
        restaurantId: restaurantId,
        tableNumber: tableNumber,
        message: "Need assistance",
      });

      if (res.data && res.data.success) {
        toast.success("Waiter has been called! 🏃‍♂️", { duration: 4000 });
        setIsCooldown(true);

        // 3 Minute (180 seconds) ka cooldown taaki spam na ho
        setTimeout(
          () => {
            setIsCooldown(false);
          },
          3 * 60 * 1000,
        );
      }
    } catch (error) {
      // Backend se rate limiter ka jo message aayega (Jaise: "Already informed...") wo toast me dikhayenge
      const errorMsg =
        error.response?.data?.message ||
        "Failed to call waiter. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <button
      onClick={handleCallWaiter}
      disabled={isCalling || isCooldown}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full shadow-2xl font-bold text-white transition-all transform active:scale-95 ${
        isCooldown
          ? "bg-gray-400 cursor-not-allowed"
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
  );
};

export default CallWaiterButton;
