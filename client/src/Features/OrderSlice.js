import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
  activeCount: 0, // Sirf pending ya preparing orders ka count
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    // 1. API se orders aane par set karna
    setOrders: (state, action) => {
      state.orders = action.payload;
      // Sirf un orders ko count karega jo "Pending" ya "Preparing" hain
      state.activeCount = action.payload.filter(
        (order) => order.status === "Pending" || order.status === "Preparing",
      ).length;
    },
    // 2. Naya order aane par (Firebase foreground listener ke liye)
    addLiveOrder: (state, action) => {
      state.orders.unshift(action.payload);
      const status = action.payload.status || "Pending";
      if (status === "Pending" || status === "Preparing") {
        state.activeCount += 1;
      }
    },
    // 3. Status update hone par (Cancel/Complete hone par badge count kam hoga)
    updateOrderStatusAction: (state, action) => {
      const { id, status } = action.payload;
      const order = state.orders.find((o) => o._id === id);

      if (order) {
        const wasActive =
          order.status === "Pending" || order.status === "Preparing";
        const isNowActive = status === "Pending" || status === "Preparing";

        order.status = status;

        if (wasActive && !isNowActive) {
          // Agar active se complete/cancel hua toh count kam karo
          state.activeCount = Math.max(0, state.activeCount - 1);
        } else if (!wasActive && isNowActive) {
          state.activeCount += 1;
        }
      }
    },
  },
});

export const { setOrders, addLiveOrder, updateOrderStatusAction } =
  orderSlice.actions;

export default orderSlice.reducer;
