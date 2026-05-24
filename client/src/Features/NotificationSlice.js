import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // 1. API se notifications aane par set karna
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      // Automatically unread count calculate kar lega
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
    },
    // 2. Naya notification aane par (Firebase foreground listener ke liye)
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    // 3. Mark all as read
    markAllReadAction: (state) => {
      state.notifications.forEach((n) => (n.isRead = true));
      state.unreadCount = 0;
    },
    // 4. Mark single as read
    markSingleReadAction: (state, action) => {
      const notif = state.notifications.find((n) => n._id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    // 5. Delete single
    removeNotificationAction: (state, action) => {
      const index = state.notifications.findIndex(
        (n) => n._id === action.payload,
      );
      if (index !== -1) {
        if (!state.notifications[index].isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    // 6. Clear all
    clearAllNotificationsAction: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAllReadAction,
  markSingleReadAction,
  removeNotificationAction,
  clearAllNotificationsAction,
} = notificationSlice.actions;

export default notificationSlice.reducer;
