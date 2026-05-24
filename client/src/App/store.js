import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Features/auth/AuthSlice";
import cartReducer from "../Features/Cart/CartSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import { combineReducers } from "redux";
import notificationReducer from "../Features/NotificationSlice";
import orderReducer from "../Features/OrderSlice";

const persistConfig = {
  key: "bhojanqr_root",
  storage,
};

const reducers = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  notifications: notificationReducer,
  orders: orderReducer,
});

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
