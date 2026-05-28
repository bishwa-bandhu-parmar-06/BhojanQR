import React from "react";
import { ShoppingBag } from "lucide-react";
import OrderCard from "./OrderCard";

const OrderList = ({ orders, handleStatusChange, emptyMessage }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-700">No Orders</h3>
        <p className="text-gray-500 mt-2">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-200">
      {orders.map((order) => (
        <OrderCard
          key={order._id}
          order={order}
          handleStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
};

export default OrderList;
