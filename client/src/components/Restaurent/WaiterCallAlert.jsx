import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BellRing, CheckCircle2, CheckCircle } from "lucide-react";
import { markSingleNotificationAsRead } from "../../API/notificationApi";
import { markSingleReadAction } from "../../Features/NotificationSlice";

const WaiterCallAlert = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(
    (state) => state.notifications?.notifications || [],
  );

  const audioRef = useRef(null);

  // 🛠️ CHANGED: Ab hum single state ki jagah directly unread array use karenge
  const activeCalls = notifications.filter(
    (n) => n.type === "WAITER_CALL" && n.isRead === false,
  );

  useEffect(() => {
    // 🛠️ CHANGED: Agar ek bhi call active hai, toh audio play karo
    if (activeCalls.length > 0) {
      if (!audioRef.current) {
        audioRef.current = new Audio("/massage_tone.mp3");
        audioRef.current.loop = true;
      }
      audioRef.current
        .play()
        .catch((e) => console.log("Browser blocked autoplay", e));
    } else {
      // Jab saari calls acknowledge ho jayein toh audio band karo
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
  }, [activeCalls.length]); // Depend on the number of active calls

  // 🛠️ CHANGED: Acknowledge function ab specific call ID accept karega
  const handleAcknowledge = async (callId) => {
    try {
      dispatch(markSingleReadAction(callId));
      await markSingleNotificationAsRead(callId);
    } catch (error) {
      console.error("Failed to acknowledge waiter call", error);
    }
  };

  // Optional: Ek saath sabhi ko clear karne ka function
  const handleAcknowledgeAll = () => {
    activeCalls.forEach((call) => handleAcknowledge(call._id));
  };

  // Agar koi call nahi hai toh component hide kardo
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
            Waiter Called!
          </h3>
          <p className="text-sm font-bold text-gray-500 mb-4 shrink-0">
            {activeCalls.length} Table{activeCalls.length > 1 ? "s" : ""}{" "}
            waiting
          </p>

          {/* 🛠️ CHANGED: Scrollable List banayi hai saari tables show karne ke liye */}
          <div className="overflow-y-auto space-y-3 mb-6 px-1 flex-1 min-h-0 custom-scrollbar">
            {activeCalls.map((call) => (
              <div
                key={call._id}
                className="bg-orange-50 py-3 px-4 rounded-2xl border border-orange-100 shadow-sm flex items-center justify-between text-left"
              >
                <div>
                  <p className="text-orange-700 font-bold text-lg">
                    {call.title}
                  </p>
                  <p className="text-gray-600 text-xs mt-0.5 line-clamp-1">
                    {call.message}
                  </p>
                </div>

                {/* Individual Acknowledge Button */}
                <button
                  onClick={() => handleAcknowledge(call._id)}
                  className="ml-3 p-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-md active:scale-95 shrink-0"
                  title="Acknowledge this table"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Acknowledge All Button (Agar 2 se zyada calls ek sath aati hain toh easy padega) */}
          {activeCalls.length > 1 && (
            <button
              onClick={handleAcknowledgeAll}
              className="group w-full py-3.5 px-6 bg-green-600 text-white font-bold text-md rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 active:scale-95 flex items-center justify-center gap-2 overflow-hidden relative shrink-0"
            >
              <span className="relative z-10 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                Acknowledge All
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaiterCallAlert;
