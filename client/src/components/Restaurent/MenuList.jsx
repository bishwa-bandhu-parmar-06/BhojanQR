import React from "react";
import MenuItemCard from "./MenuItemCard";

const MenuList = ({ items, loading, onEdit, onDelete, onToggleAvailable }) => {
  // Professional Loading State
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-4 border-orange-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-4 border-orange-300 animate-spin opacity-50"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">
          Loading your menu...
        </p>
      </div>
    );
  }

  // Polished Empty State
  if (!items || items.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center gap-4 mt-6">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-2">
          <img
            src="/nomenu.png"
            alt="No Menu Items"
            className="w-12 h-12 opacity-50 grayscale"
          />
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-gray-800">
            Your menu is empty
          </h3>
          <p className="text-gray-500 mt-2 font-medium max-w-sm mx-auto">
            Click the "Add New Item" button above to start building your
            restaurant's digital menu.
          </p>
        </div>
      </div>
    );
  }

  // Menu Grid Layout
  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
      {items.map((item) => (
        <MenuItemCard
          key={item._id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleAvailable={onToggleAvailable}
        />
      ))}
    </div>
  );
};

export default MenuList;
