import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  BellRing,
  CheckCircle2,
  CheckCircle,
  Utensils,
  Droplet,
  FileText,
  FileSpreadsheet,
  HelpCircle,
} from "lucide-react";
import { markSingleNotificationAsRead } from "../../API/notificationApi";
import { markSingleReadAction } from "../../Features/NotificationSlice";

const WaiterCallAlert = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(
    (state) => state.notifications?.notifications || [],
  );

  const audioRef = useRef(null);

  // Filter unread WAITER_CALL notifications
  const activeCalls = notifications.filter(
    (n) => n.type === "WAITER_CALL" && n.isRead === false,
  );

  useEffect(() => {
    // If there is any active waiter call, play loop audio
    if (activeCalls.length > 0) {
      if (!audioRef.current) {
        audioRef.current = new Audio("/massage_tone.mp3");
        audioRef.current.loop = true;
      }
      audioRef.current
        .play()
        .catch((e) => console.log("Browser blocked autoplay", e));
    } else {
      // Pause audio when all calls are acknowledged
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [activeCalls.length]);

  const handleAcknowledge = async (callId) => {
    try {
      dispatch(markSingleReadAction(callId));
      await markSingleNotificationAsRead(callId);
    } catch (error) {
      console.error("Failed to acknowledge waiter call", error);
    }
  };

  const handleAcknowledgeAll = () => {
    activeCalls.forEach((call) => handleAcknowledge(call._id));
  };

  // 🚀 HELPER FUNCTION: Request Message ke basis par unique background badges aur icons lagane ke liye
  const getRequestBadgeStyle = (messageText) => {
    const msg = messageText?.toLowerCase() || "";
    if (msg.includes("water")) {
      return {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Droplet,
      };
    } else if (msg.includes("bill")) {
      return {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: FileText,
      };
    } else if (msg.includes("tissue")) {
      return {
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: FileSpreadsheet,
      };
    } else if (msg.includes("spoon") || msg.includes("fork")) {
      return {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: Utensils,
      };
    } else {
      return {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: HelpCircle,
      };
    }
  };

  if (activeCalls.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border-2 border-orange-200 relative flex flex-col max-h-[80vh]">
        {/* Top Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-green-400 shrink-0"></div>

        {/* Subtle Pulsing Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-green-500/5 animate-pulse pointer-events-none"></div>

        <div className="p-6 text-center relative z-10 flex-1 overflow-hidden flex flex-col">
          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner animate-bounce shrink-0">
            <BellRing className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight shrink-0">
            Waiter Desk Alerts
          </h3>
          <p className="text-sm font-bold text-gray-500 mb-4 shrink-0">
            {activeCalls.length} Active Table Call
            {activeCalls.length > 1 ? "s" : ""}
          </p>

          {/* Scrollable List for multiple incoming calls */}
          <div className="overflow-y-auto space-y-3 mb-6 px-1 flex-1 min-h-0 custom-scrollbar">
            {activeCalls.map((call) => {
              const badge = getRequestBadgeStyle(call.message);
              const IconComp = badge.icon;

              return (
                <div
                  key={call._id}
                  className="bg-gray-50 py-4 px-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between text-left"
                >
                  <div className="flex-1 min-w-0">
                    {/* 🚀 Dynamic Header Display (Jaise: Table 5 Calling) */}
                    <p className="text-gray-900 font-black text-lg tracking-tight leading-none">
                      {call.title || "Table Call Request"}
                    </p>

                    {/* 🚀 CRISP DESCRIPTION BADGE: Clear display of customer's intent */}
                    <div className="mt-2.5 flex items-center gap-1.5 w-max">
                      <div
                        className={`px-2.5 py-1 rounded-xl border font-extrabold text-xs flex items-center gap-1 shadow-sm ${badge.color}`}
                      >
                        <IconComp size={13} strokeWidth={2.5} />
                        <span>{call.message || "Assistance Needed"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Individual Check Button */}
                  <button
                    onClick={() => handleAcknowledge(call._id)}
                    className="ml-3 p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-md active:scale-95 shrink-0"
                    title="Acknowledge this request"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Mass Action Clear Button */}
          {activeCalls.length > 1 && (
            <button
              onClick={handleAcknowledgeAll}
              className="group w-full py-3.5 px-6 bg-green-600 text-white font-bold text-md rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 active:scale-95 flex items-center justify-center gap-2 overflow-hidden relative shrink-0"
            >
              <span className="relative z-10 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                Clear All Requests
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaiterCallAlert;
