import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item._id === newItem._id);

      state.totalQuantity++;
      state.totalAmount += Number(newItem.price);

      if (!existingItem) {
        // If it's a new item, add it to the array with quantity 1
        state.items.push({
          ...newItem,
          quantity: 1,
        });
      } else {
        // If it already exists, just increment the quantity
        existingItem.quantity++;
      }
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      const existingItem = state.items.find((item) => item._id === id);

      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalAmount -= Number(existingItem.price) * existingItem.quantity;
        state.items = state.items.filter((item) => item._id !== id);
      }
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item._id === id);

      if (existingItem) {
        const quantityDifference = quantity - existingItem.quantity;
        state.totalQuantity += quantityDifference;
        state.totalAmount += Number(existingItem.price) * quantityDifference;
        existingItem.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
