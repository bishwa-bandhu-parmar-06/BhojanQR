import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  CheckCircle2,
  Info,
  ShoppingBag,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";

//   Import ALL API functions
import {
  getRestaurantNotifications,
  markAllNotificationsAsRead,
  markSingleNotificationAsRead,
  deleteSingleNotification,
  deleteAllNotifications,
} from "../../API/notificationApi";

//   Import REDUX Actions
import {
  setNotifications,
  markAllReadAction,
  markSingleReadAction,
  removeNotificationAction,
  clearAllNotificationsAction,
} from "../../Features/NotificationSlice";

const NotificationManager = () => {
  const dispatch = useDispatch();

  // Local state ki jagah ab seedha Redux se notifications aayengi
  const notifications = useSelector(
    (state) => state.notifications?.notifications || [],
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  useEffect(() => {
    fetchNotifs();
  }, []);

  const fetchNotifs = async () => {
    try {
      const res = await getRestaurantNotifications();
      if (res.data && res.data.success) {
        //   Dispatch to Redux Store
        dispatch(setNotifications(res.data.data));
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Could not load notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "ORDER_PLACED":
      case "NEW_ORDER":
        return <ShoppingBag className="w-5 h-5 text-green-500" />;
      case "ORDER_UPDATE":
        return <Info className="w-5 h-5 text-orange-500" />;
      case "ACCOUNT_APPROVED":
        return <ShieldCheck className="w-5 h-5 text-blue-500" />;
      case "ACCOUNT_REJECTED":
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // ==========================================
  // NOTIFICATION HANDLERS (REDUX INTEGRATED)
  // ==========================================

  const handleMarkAllAsRead = async () => {
    const unreadExists = notifications.some((n) => !n.isRead);
    if (!unreadExists || notifications.length === 0) {
      toast.success("Already caught up!");
      return;
    }
    try {
      await markAllNotificationsAsRead();
      dispatch(markAllReadAction()); //   Update Redux State instantly
      toast.success("All caught up!", { icon: "✅" });
    } catch (error) {
      toast.error("Failed to mark all as read.");
    }
  };

  const handleClearAllClick = () => {
    if (notifications.length === 0) return;
    setIsClearModalOpen(true);
  };

  const confirmClearAll = async () => {
    setIsClearModalOpen(false);
    try {
      await deleteAllNotifications();
      dispatch(clearAllNotificationsAction()); //   Clear from Redux
      toast.success("All notifications cleared", { icon: "🗑️" });
    } catch (error) {
      toast.error("Failed to clear notifications.");
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      dispatch(markSingleReadAction(id)); //   Optimistic UI update via Redux
      await markSingleNotificationAsRead(id);
    } catch (error) {
      fetchNotifs();
      toast.error("Action failed.");
    }
  };

  const handleDeleteSingle = async (id) => {
    try {
      dispatch(removeNotificationAction(id)); //   Optimistic delete via Redux
      await deleteSingleNotification(id);
      toast.success("Deleted", { id: "delete-toast" });
    } catch (error) {
      fetchNotifs();
      toast.error("Failed to delete.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-orange-500 border-opacity-70"></div>
          <p className="text-gray-500 text-sm font-medium animate-pulse">
            Loading updates...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      {/* ... [Aapka Baaki Pura UI Exactly Same Rahega, Koi Change Nahi] ... */}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            Notifications
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Stay updated with your restaurant's latest activities.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleMarkAllAsRead}
            disabled={notifications.length === 0}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="hidden sm:inline">Mark all read</span>
            <span className="sm:hidden">Read All</span>
          </button>
          <button
            onClick={handleClearAllClick}
            disabled={notifications.length === 0}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white border border-red-100 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear all</span>
            <span className="sm:hidden">Clear</span>
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-10 sm:p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100 shadow-sm">
              <Bell className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">
              No notifications yet
            </h3>
            <p className="text-gray-500 text-sm mt-2 max-w-xs">
              When you receive new orders or account updates, they will appear
              here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row gap-4 transition-all hover:bg-gray-50/80 group ${notif.isRead ? "bg-white" : "bg-orange-50/40"}`}
              >
                <div className="flex gap-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${notif.isRead ? "bg-gray-100 text-gray-500" : "bg-white shadow-sm border border-orange-100"}`}
                    >
                      {getIcon(notif.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4
                        className={`text-sm font-bold ${notif.isRead ? "text-gray-600" : "text-gray-900"}`}
                      >
                        {notif.title}
                      </h4>
                      <span className="hidden sm:inline-block text-xs font-medium text-gray-400 whitespace-nowrap ml-4 bg-gray-50 px-2 py-1 rounded-md">
                        {new Date(notif.createdAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-1 leading-relaxed pr-2 ${notif.isRead ? "text-gray-500" : "text-gray-700 font-medium"}`}
                    >
                      {notif.message}
                    </p>
                    <p className="sm:hidden text-xs text-gray-400 mt-2 font-medium">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end sm:justify-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pt-3 sm:pt-0 border-t sm:border-none border-gray-100 mt-2 sm:mt-0">
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkSingleRead(notif._id)}
                      title="Mark as read"
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteSingle(notif._id)}
                    title="Delete notification"
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  {!notif.isRead && (
                    <div className="sm:hidden w-2.5 h-2.5 ml-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                  )}
                </div>
                {!notif.isRead && (
                  <div className="hidden sm:flex flex-shrink-0 items-center pl-2 group-hover:hidden">
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-800 mb-2">
                Clear All Notifications?
              </h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                This action cannot be undone. All your read and unread
                notifications will be permanently deleted from the system.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsClearModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearAll}
                  className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 active:scale-95"
                >
                  Yes, Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;
